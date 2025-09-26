import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Modal,
  Form,
  Input,
  Select,
  Table,
  Tag,
  InputNumber,
  message,
  Tooltip,
} from "antd";
import { toast } from "react-toastify";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Edit } from "lucide-react";
import { useSelector } from "react-redux";
import { apiGet, apiPost, apiPut, apiDelete } from "../../api";
import "../../stylings/Templates.css";

const MEDICINE_TYPES = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Injection",
  "Ointment",
  "Other",
];
const FREQ = [
  "1-0-0",
  "0-1-0",
  "0-0-1",
  "1-1-0",
  "1-0-1",
  "0-1-1",
  "1-1-1",
  "SOS",
  "Other",
];
const TIMINGS = [
  "Before Breakfast",
  "After Breakfast",
  "Before Lunch",
  "After Lunch",
  "Before Dinner",
  "After Dinner",
  "Bedtime",
];

const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDDMonYYYY = (val) => {
  if (!val) return "-";
  const d = new Date(val);
  if (isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const mon = monthShort[d.getMonth()];
  const yr = d.getFullYear();
  return `${day}-${mon}-${yr}`;
};

const DOSAGE_REGEX =
  /^\d+(\.\d+)?\s*(mg|mcg|g|kg|ml|l|tablet|tab|capsule|cap|tsp|tbsp|tablespoon|teaspoon|spoon|drop|unit|puff|spray|amp|ampoule|vial)s?$/i;

const isFixedQtyType = (t) => ["Tablet", "Capsule", "Injection"].includes(t);
const onesInFreq = (freq) =>
  typeof freq === "string" && freq !== "SOS"
    ? freq.split("-").filter((x) => x === "1").length
    : 0;

export default function Templates() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, contextHolder] = Modal.useModal();

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [form] = Form.useForm();

  // Inventory state
  const [medInventory, setMedInventory] = useState([]);
  const [medicineOptions, setMedicineOptions] = useState([]);

  const user = useSelector((s) => s.currentUserData);
  const doctorId =
    (user?.role === "doctor" && user?.userId) ||
    user?.createdBy ||
    user?.userId ||
    "";

  const fetchTemplates = async () => {
    if (!doctorId) {
      message.error("Missing doctorId. Please login again.");
      return;
    }
    try {
      setLoading(true);
      const res = await apiGet(`/template/getTemplatesByDoctorId?doctorId=${doctorId}`);
      const data = res?.data?.data || res?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      message.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  // Fetch inventory (for dropdown)
  const fetchInventory = async () => {
    try {
      const response = await apiGet("/pharmacy/getAllMedicinesByDoctorID");
      const medicines = response?.data?.data || [];

      const sortedMedicines = [...medicines].sort((a, b) =>
        (a?.medName || "").localeCompare(b?.medName || "")
      );

      setMedInventory(sortedMedicines);
      setMedicineOptions(
        sortedMedicines.map((med) => ({
          value: med._id, // keep value as the inventory id
          label: `${med.medName} ${med.dosage}`,
          medName: med.medName,
          dosage: med.dosage,
          medInventoryId: med._id,
          price: med.price,
        }))
      );
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [doctorId]);

  useEffect(() => {
    fetchInventory();
  }, [doctorId]);

  const onOpenModal = () => {
    setIsEditing(false);
    setEditingTemplate(null);
    form.resetFields();
    form.setFieldsValue({ medications: [{}] });
    setModalOpen(true);
  };

  const onEdit = (record) => {
    try {
      const mappedMeds = (record?.medications || []).map((m) => ({
        _id: m?._id,
        medName: m?.medName || "",
        medicineType: m?.medicineType || undefined,
        quantity: m?.quantity ?? undefined,
        dosage: m?.dosage || "",
        duration: m?.duration ?? undefined,
        frequency: m?.frequency || undefined,
        timings: Array.isArray(m?.timings) ? m.timings : [],
        notes: m?.notes || "",
        medInventoryId: m?.medInventoryId || undefined,
      }));

      form.resetFields();
      form.setFieldsValue({
        name: record?.name || "",
        medications: mappedMeds.length ? mappedMeds : [{}],
      });

      setIsEditing(true);
      setEditingTemplate(record);
      setModalOpen(true);

      setTimeout(() => recalcQuantities(), 0);
    } catch (err) {
      console.error(err);
      message.error("Failed to open edit form");
    }
  };

  const onDelete = (record) => {
    modal.confirm({
      title: "Delete Template",
      content: `Are you sure you want to delete "${record?.name || "this template"}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      cancelText: "Cancel",
      zIndex: 4000,
      onOk: async () => {
        if (!record?._id) return;
        try {
          setLoading(true);
          await apiDelete(`/template/deleteTemplate/${record._id}?doctorId=${doctorId}`);
          setItems((prev) => (prev || []).filter((it) => it._id !== record._id));
          message.success("Template deleted");
        } catch (err) {
          console.error(err);
          message.error(err?.response?.data?.message || "Failed to delete template");
          await fetchTemplates();
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const onCreateOrUpdate = async () => {
    try {
      const values = await form.validateFields();
      if (!doctorId) {
        message.error("Missing doctorId. Please login again.");
        return;
      }

      if (isEditing && editingTemplate?._id) {
        const payload = {
          name: (values.name || "").trim(),
          status: "active",
          medications: (values.medications || []).map((m) => {
            const base = {
              medName: (m.medName || "").trim(),
              medicineType: m.medicineType,
              quantity: Number(m.quantity),
              dosage: (m.dosage || "").trim(),
              duration: Number(m.duration),
              frequency: m.frequency,
              timings: m.timings || [],
              notes: (m.notes || "").trim(),
              status: "active",
            };
            if (m._id) base._id = m._id;
            if (m.medInventoryId) base.medInventoryId = m.medInventoryId;
            return base;
          }),
        };

        setSubmitting(true);
        const res = await apiPut(`/template/updateTemplate/${editingTemplate._id}`, payload);
        const updated = res?.data?.data || res?.data;

        if (updated && (updated._id || updated.name)) {
          setItems((prev) => (prev || []).map((it) => (it._id === editingTemplate._id ? { ...it, ...updated } : it)));
        } else {
          await fetchTemplates();
        }

        setModalOpen(false);
        setIsEditing(false);
        setEditingTemplate(null);
        message.success("Template updated");
      } else {
        const payload = {
          name: (values.name || "").trim(),
          userId: doctorId,
          createdBy: doctorId,
          medications: (values.medications || []).map((m) => ({
            medName: (m.medName || "").trim(),
            medicineType: m.medicineType,
            quantity: Number(m.quantity),
            dosage: (m.dosage || "").trim(),
            duration: Number(m.duration),
            frequency: m.frequency,
            timings: m.timings || [],
            notes: (m.notes || "").trim(),
            ...(m.medInventoryId ? { medInventoryId: m.medInventoryId } : {}),
          })),
        };

        setSubmitting(true);
        const res = await apiPost("/template/addTemplate", payload);
        const created = res?.data?.data || res?.data;

        if (created && (created._id || created.name)) {
          setItems((prev) => [created, ...(Array.isArray(prev) ? prev : [])]);
        } else {
          await fetchTemplates();
        }

        setModalOpen(false);
        message.success("Template saved");
      }
    } catch (err) {
      if (!err?.errorFields) {
        console.error(err);
        toast.error(
          err?.response?.data?.message?.message ||
            err?.response?.data?.message ||
            (isEditing ? "Failed to update template" : "Failed to save template")
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "#",
        key: "idx",
        width: 70,
        align: "center",
        render: (_v, _r, index) => <span style={{ color: "#64748b" }}>{index + 1}</span>,
      },
      {
        title: "Template",
        dataIndex: "name",
        key: "name",
        width: 260,
        render: (text) => (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>{text}</span>
          </div>
        ),
      },
      {
        title: "Medications Summary",
        dataIndex: "medications",
        key: "medications",
        render: (meds) => {
          const arr = Array.isArray(meds) ? meds : [];
          if (!arr.length) return <span style={{ color: "#94a3b8" }}>No meds</span>;
          return (
            <div className="medsWrap" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {arr.map((m, idx) => {
                const text = [
                  m?.medName,
                  m?.dosage,
                  m?.frequency,
                  (m?.timings || []).join(", "),
                  m?.medicineType,
                  (m?.quantity || m?.duration) ? `Qty ${m?.quantity ?? "-"} • ${m?.duration ?? "-"}d` : null,
                ].filter(Boolean).join(" • ");

                return (
                  <Tooltip title={text} key={`${m?.medName || "med"}-${idx}`}>
                    <Tag
                      className="medTag"
                      style={{
                        borderRadius: 6,
                        padding: "2px 8px",
                        background: "#f1f5f9",
                        border: "1px solid #e2e8f0",
                        color: "#0f172a",
                        maxWidth: 360,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{m?.medName}</span>
                      {m?.dosage ? <span style={{ marginLeft: 6 }}>({m.dosage})</span> : null}
                    </Tag>
                  </Tooltip>
                );
              })}
            </div>
          );
        },
      },
      {
        title: "Updated On",
        dataIndex: "updatedAt",
        key: "updatedAt",
        width: 160,
        sorter: (a, b) => new Date(a?.updatedAt || 0).getTime() - new Date(b?.updatedAt || 0).getTime(),
        defaultSortOrder: "descend",
        render: (d) => <span style={{ color: "#0f172a" }}>{formatDDMonYYYY(d)}</span>,
      },
      {
        title: "Actions",
        key: "actions",
        width: 180,
        render: (_v, record) => (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Tooltip title="Edit">
              <Edit size={20} style={{ cursor: "pointer", color: "#2563eb" }} onClick={() => onEdit(record)} />
            </Tooltip>
            <Tooltip title="Delete">
              <DeleteOutlined
                className="icon-delete"
                style={{ fontSize: 20, cursor: "pointer", color: "#ef4444", marginLeft: 4 }}
                onClick={() => onDelete(record)}
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    []
  );

  // --- Quantity auto-calc for Tablet/Capsule ---
  const recalcQuantities = () => {
    const meds = form.getFieldValue("medications") || [];
    const next = meds.map((m) => {
      const type = m?.medicineType;
      if (isFixedQtyType(type)) {
        const dur = Number(m?.duration);
        const freq = m?.frequency;
        const perDay = onesInFreq(freq);
        if (!dur || !perDay) {
          return { ...m, quantity: undefined };
        }
        return { ...m, quantity: dur * perDay };
      } else {
        return m;
      }
    });
    form.setFieldsValue({ medications: next });
  };

  const handleValuesChange = (changed, _all) => {
    if (changed?.medications || typeof changed?.medications === "object") {
      recalcQuantities();
    }
  };

  // When selecting from inventory, set medName, dosage, medInventoryId and lock fields
  const handleSelectInventory = (rowIndex, option) => {
    const meds = form.getFieldValue("medications") || [];
    const selected = medicineOptions.find((o) => o.medInventoryId === option.value);
    const curr = meds[rowIndex] || {};
    const nextRow = {
      ...curr,
      medName: selected?.medName || "",
      dosage: selected?.dosage || "",
      medInventoryId: selected?.medInventoryId,
    };
    meds[rowIndex] = nextRow;
    form.setFieldsValue({ medications: meds });
  };

  // Clearing inventory selection should unlock medName & dosage (remove medInventoryId)
  const handleClearInventory = (rowIndex) => {
    const meds = form.getFieldValue("medications") || [];
    const curr = meds[rowIndex] || {};
    const nextRow = { ...curr };
    delete nextRow.medInventoryId;
    meds[rowIndex] = nextRow;
    form.setFieldsValue({ medications: meds });
  };

  return (
    <div className="page" style={{ position: "relative" }}>
      {contextHolder}

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "#fff",
          padding: "12px 0 8px",
          display: "flex",
          justifyContent: "flex-end",
          borderBottom: "1px solid #f1f5f9",
          marginBottom: 12,
        }}
      >
        <Button type="primary" icon={<PlusOutlined />} onClick={onOpenModal}>
          Add Template
        </Button>
      </div>

      <Table
        className="table"
        rowKey={(r) => r?._id || r?.uniqueId || String(Math.random())}
        loading={loading}
        columns={columns}
        dataSource={items}
        size="middle"
        bordered
        sticky
        pagination={{ pageSize: 8, showSizeChanger: false }}
        tableLayout="auto"
        locale={{ emptyText: "No data found" }}
      />

      <Modal
        title={isEditing ? "Edit Template" : "Add Template"}
        open={modalOpen}
        onOk={onCreateOrUpdate}
        okText={isEditing ? "Save Changes" : "Save"}
        confirmLoading={submitting}
        onCancel={() => {
          setModalOpen(false);
          setIsEditing(false);
          setEditingTemplate(null);
        }}
        destroyOnClose
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          name="templateForm"
          className="form"
          onValuesChange={handleValuesChange}
        >
          <Form.Item
            label="Template Name (e.g., Fever)"
            name="name"
            rules={[
              { required: true, message: "Please enter template name" },
              { min: 2, message: "Must be at least 2 characters" },
            ]}
          >
            <Input placeholder="e.g., Fever" allowClear />
          </Form.Item>

          <Form.List
            name="medications"
            rules={[
              {
                validator: async (_, medications) => {
                  if (!medications || medications.length < 1) {
                    throw new Error("Add at least one medication");
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <div className="medsSection">
                <div
                  className="medsHeader"
                  style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <h3 className="medsTitle" style={{ margin: 0 }}>Medications</h3>
                  <Button onClick={() => add({}, 0)} type="dashed" icon={<PlusOutlined />}>
                    Add medication
                  </Button>
                </div>

                {fields.map((field, index) => {
                  const medInvIdPath = ["medications", field.name, "medInventoryId"];
                  const typePath = ["medications", field.name, "medicineType"];
                  const inventorySelected = !!form.getFieldValue(medInvIdPath);
                  const qtyDisabled = isFixedQtyType(form.getFieldValue(typePath));

                  // Preselect inventory dropdown value if medInventoryId is present
                  const currentMedInventoryId = form.getFieldValue(medInvIdPath);

                  return (
                    <div key={field.key} className="medRow">
                      <div className="medRowGrid">
                        <Form.Item name={[field.name, "_id"]} style={{ display: "none" }}>
                          <Input />
                        </Form.Item>

                        {/* Inventory Select (fills & locks medName + dosage) */}
                        <Form.Item label="Pick from Inventory (optional)">
                          <Select
                            showSearch
                            allowClear
                            placeholder="Search medicine from inventory"
                            value={currentMedInventoryId || undefined}
                            onChange={(val) => {
                              if (val) {
                                handleSelectInventory(field.name, { value: val });
                              } else {
                                handleClearInventory(field.name);
                              }
                            }}
                            optionFilterProp="label"
                            options={medicineOptions}
                            filterOption={(input, option) =>
                              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                          />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "medName"]}
                          label="Medicine Name"
                          rules={[{ required: true, message: "Enter medicine name" }]}
                        >
                          <Input placeholder="e.g., Dolo 650" disabled={inventorySelected} />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "medicineType"]}
                          label="Type"
                          rules={[{ required: true, message: "Select type" }]}
                        >
                          <Select placeholder="Select">
                            {MEDICINE_TYPES.map((t) => (
                              <Select.Option key={t} value={t}>
                                {t}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "quantity"]}
                          label="Quantity"
                          rules={[
                            ({ getFieldValue }) => ({
                              validator: async (_, v) => {
                                const t = getFieldValue(["medications", field.name, "medicineType"]);
                                if (isFixedQtyType(t)) {
                                  return Promise.resolve();
                                }
                                if (v == null || Number(v) < 1) {
                                  return Promise.reject(new Error("Quantity must be at least 1"));
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <InputNumber
                            min={1}
                            style={{ width: "100%" }}
                            placeholder={qtyDisabled ? "Auto" : "e.g., 10"}
                            disabled={qtyDisabled}
                          />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "dosage"]}
                          label="Dosage"
                          rules={[
                            { required: true, message: "Enter dosage" },
                            {
                              validator: async (_, v) => {
                                if (!v || !String(v).trim()) throw new Error("Enter dosage");
                                if (!DOSAGE_REGEX.test(String(v).trim())) {
                                  throw new Error("Invalid dosage (e.g., 100mg, 5ml, 1 tablet)");
                                }
                              },
                            },
                          ]}
                        >
                          <Input placeholder="e.g., 650 mg" disabled={inventorySelected} />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "duration"]}
                          label="Duration (days)"
                          rules={[
                            { required: true, message: "Enter duration" },
                            {
                              validator: async (_, v) => {
                                if (v == null || Number(v) < 1) {
                                  throw new Error("Duration must be at least 1 day");
                                }
                              },
                            },
                          ]}
                        >
                          <InputNumber min={1} style={{ width: "100%" }} placeholder="e.g., 5" />
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "frequency"]}
                          label="Frequency"
                          rules={[{ required: true, message: "Select frequency" }]}
                        >
                          <Select placeholder="Select">
                            {FREQ.map((f) => (
                              <Select.Option key={f} value={f}>
                                {f}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...field}
                          name={[field.name, "timings"]}
                          label="Timings"
                          dependencies={[["medications", field.name, "frequency"]]}
                          rules={[
                            ({ getFieldValue }) => ({
                              validator: async (_, v) => {
                                const freq = getFieldValue(["medications", field.name, "frequency"]);
                                if (freq === "SOS") return Promise.resolve();
                                const required = onesInFreq(freq);
                                if (!v || v.length === 0) {
                                  return Promise.reject(new Error("Select timings"));
                                }
                                if (required > 0 && v.length !== required) {
                                  return Promise.reject(
                                    new Error(`Select exactly ${required} timing${required > 1 ? "s" : ""} for frequency ${freq}`)
                                  );
                                }
                                return Promise.resolve();
                              },
                            }),
                          ]}
                        >
                          <Select mode="multiple" placeholder="Select one or more">
                            {TIMINGS.map((t) => (
                              <Select.Option key={t} value={t}>
                                {t}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item name={[field.name, "notes"]} label="Notes (optional)">
                          <Input.TextArea rows={1} placeholder="e.g., after food" />
                        </Form.Item>

                        {/* Persist medInventoryId (drives lock state) */}
                        <Form.Item name={[field.name, "medInventoryId"]} label="Med Inventory ID (optional)">
                          <Input placeholder="ObjectId" disabled />
                        </Form.Item>
                      </div>

                      <div className="rowActions" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(field.name)}
                          disabled={fields.length === 1}
                        >
                          Remove
                        </Button>
                        <span className="rowIndex">#{index + 1}</span>
                      </div>
                    </div>
                  );
                })}

                <Form.ErrorList errors={errors} />
              </div>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  );
}

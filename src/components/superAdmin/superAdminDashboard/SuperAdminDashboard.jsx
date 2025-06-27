import { Card, Row, Col } from 'antd';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';

const data = [
  { name: 'Jan', metrics: 400 },
  { name: 'Feb', metrics: 300 },
  { name: 'Mar', metrics: 500 },
];

const SuperAdminDashboard = () =>{
  return (
    <div>
      <Card
        title={
          <span>
            <FontAwesomeIcon icon={faTachometerAlt} style={{ marginRight: 8 }} />
            Super Admin Dashboard
          </span>
        }
      >
        <Row gutter={16}>
          <Col span={24}>
            <BarChart width={500} height={300} data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="metrics" fill="#1890ff" />
            </BarChart>
             <BarChart width={500} height={300} data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="metrics" fill="#1890ff" />
            </BarChart>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default  SuperAdminDashboard
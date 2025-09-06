import React, { useState, useEffect } from 'react';
import { Card, Rate, Avatar, Button, Typography, Space, Divider, Input, message } from 'antd';
import { MessageOutlined, CalendarOutlined, SendOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../../api'; // Adjust the import path to your api.js file

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewsComponent = () => {
  const user = useSelector((state) => state.currentUserData); // Updated to match Labs.jsx
  const doctorId = user?.role === 'doctor' ? user?.userId : user?.createdBy;
  const [reviews, setReviews] = useState([]);
  const [replyStates, setReplyStates] = useState({});
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState(0);

  // Fetch token from localStorage
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        console.log('Fetched Token:', storedToken); // Debug token
        setToken(storedToken);
      } catch (error) {
        console.error('Error fetching token:', error);
        message.error('Failed to retrieve authentication token');
      }
    };
    fetchToken();
  }, []);

  // Fetch reviews from API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!token || !doctorId) {
        console.log('Missing token or doctorId:', { token, doctorId }); // Debug missing data
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await apiGet(`users/getFeedbackByDoctorId/${doctorId}`);
        console.log('API Response:', response); // Debug API response

        if (response.status === 200 && response.data?.doctor) {
          const doctorData = response.data.doctor;
          console.log('Doctor Data:', doctorData); // Debug doctor data
          setOverallRating(doctorData.overallRating || 0);

          const formattedReviews = (doctorData.feedback || []).map((feedback) => {
            const formattedReview = {
              id: feedback.feedbackId || feedback.id || `feedback-${Math.random()}`, // Fallback ID
              name: feedback.patientName || 'Unknown User',
              date: feedback.createdAt
                ? new Date(feedback.createdAt).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'N/A',
              rating: feedback.rating || 0,
              // avatar: feedback.avatar || 'https://randomuser.me/api/portraits/men/32.jpg',
              avatarColor: '#1890ff',
              review: feedback.comment || 'No review provided',
              hasReply: true, // Allow replies
              replies: feedback.reply
                ? [
                    {
                      id: `reply-${feedback.feedbackId || feedback.id}-${Date.now()}`,
                      name: user?.name || 'Dr Lakshmi Raman',
                      date: feedback.reply.timeAgo || 'Just now',
                      isDoctor: true,
                      review: feedback.reply.message || '',
                    },
                  ]
                : [],
            };
            console.log('Formatted Review:', formattedReview); // Debug each review
            return formattedReview;
          });

          console.log('Formatted Reviews:', formattedReviews); // Debug final reviews array
          setReviews(formattedReviews);
        } else {
          console.error('Invalid response structure:', response.data);
          message.error(response.data.message || 'Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        message.error(error.response?.data?.message || 'Failed to fetch reviews');
      }
      setLoading(false);
    };

    fetchReviews();
  }, [token, doctorId, user]);

  // Debug reviews state after update
  useEffect(() => {
    console.log('Reviews State:', reviews); // Debug reviews state
  }, [reviews]);

  const toggleReplyBox = (reviewId) => {
    setReplyStates((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        showReplyBox: !prev[reviewId]?.showReplyBox,
        replyText: prev[reviewId]?.replyText || '',
      },
    }));
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyStates((prev) => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        replyText: value,
      },
    }));
  };

  const submitReply = async (reviewId) => {
    const replyText = replyStates[reviewId]?.replyText;
    if (!replyText || replyText.trim() === '') {
      message.warning('Please enter a reply message');
      return;
    }

    const payload = {
      feedbackId: reviewId,
      message: replyText.trim(),
    };

    try {
      const response = await apiPost('users/submitDoctorReply', payload);
      console.log('Reply submission response:', response.data); // Debug reply response

      if (response.data.status === 'success') {
      const newReply = {
        id: `reply-${reviewId}-${Date.now()}`,
        name: user?.name || 'Dr Lakshmi Raman',
        date: 'Just now',
        avatar:
        user?.avatar ||
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face',
        isDoctor: true,
        review: replyText.trim(),
      };

      setReviews((prev) =>
        prev.map((review) =>
        review.id === reviewId
          ? {
            ...review,
            replies: [...(review.replies || []), newReply],
          }
          : review
        )
      );

      setReplyStates((prev) => ({
        ...prev,
        [reviewId]: {
        showReplyBox: false,
        replyText: '',
        },
      }));

      message.success('Reply posted successfully!');
      alert('Reply posted successfully!');
      } else {
      message.error(response.data.message || 'Failed to submit reply');
      alert(response.data.message || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error.response?.data?.message?.message );
      message.error(error.response?.data?.message?.message || 'An unexpected error occurred while submitting the reply');
      alert(error.response?.data?.message?.message || 'An unexpected error occurred while submitting the reply');
    }
  };

  const cancelReply = (reviewId) => {
    setReplyStates((prev) => ({
      ...prev,
      [reviewId]: {
        showReplyBox: false,
        replyText: '',
      },
    }));
  };

  const renderReply = (reply) => (
    <div
      key={reply.id}
      style={{
        marginLeft: 52,
        marginTop: 16,
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        border: '1px solid #e2e8f0',
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar
          size={32}
          style={{
            backgroundColor: '#1890ff',
            flexShrink: 0,
          }}
          src={reply.avatar}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 8 }}>
            <Text
              strong
              style={{
                fontSize: 14,
                color: '#1890ff',
              }}
            >
              {reply.name}
            </Text>
            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
              {reply.date}
            </Text>
          </div>
          <Paragraph
            style={{
              margin: 0,
              color: '#4b5563',
              lineHeight: 1.5,
              fontSize: 14,
            }}
          >
            {reply.review}
          </Paragraph>
        </div>
      </div>
    </div>
  );

  // Simplified avatar rendering
  const getAvatarContent = (review) => {
    return review.avatar || review.name[0];
  };

  // Handle case when user is not logged in or data is not loaded
  if (!user || !token) {
    console.log('User or Token Missing:', { user, token }); // Debug user/token issue
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Title level={3}>Please log in to view reviews</Title>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0px' }}>
      <Title level={3} style={{ marginBottom: 24, color: '#1f2937' }}>
        Reviews
      </Title>
      <Divider />

      {/* Overall Rating Card */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 10,
        }}
      >
        <Title level={3} style={{ marginBottom: 16, color: '#1f2937' }}>
          Overall Rating
        </Title>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
              <Text style={{ fontSize: 32, fontWeight: 600, color: '#1f2937' }}>
                {loading ? 'Loading...' : overallRating.toFixed(1)}
              </Text>
              <Rate disabled value={Math.round(overallRating)} style={{ fontSize: 18 }} />
            </div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              Based on {reviews.length} reviews
            </Text>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: '#6b7280',
              fontSize: 14,
            }}
          >
            <CalendarOutlined />
            <Text type="secondary">06/28/2025 - 07/01/2025</Text>
          </div>
        </div>
      </Card>

      {/* Reviews Card */}
      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {loading ? (
            <Text>Loading reviews...</Text>
          ) : reviews.length === 0 ? (
            <Text>No reviews available</Text>
          ) : (
            reviews.map((review, index) => {
              console.log('Rendering Review:', review); // Debug each review being rendered
              return (
                <div key={review.id}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <Avatar
                      size={40}
                      style={{
                        backgroundColor: review.avatarColor || '#1890ff',
                        flexShrink: 0,
                      }}
                      src={review.avatar}
                    />
                    <div style={{ flex: 1, minWidth: 0, backgroundColor: '#F3FFFD' }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 15,
                          flexWrap: 'wrap',
                          gap: '8px',
                        }}
                      >
                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: 16,
                              color: review.isDoctor ? '#1890ff' : '#1f2937',
                            }}
                          >
                            {review.name}
                          </Text>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
                            {review.date}
                          </Text>
                        </div>
                        {review.rating && (
                          <Rate disabled value={review.rating} style={{ fontSize: 14 }} />
                        )}
                      </div>
                      <Paragraph
                        style={{
                          margin: 0,
                          marginBottom: 12,
                          color: '#4b5563',
                          lineHeight: 1.6,
                        }}
                      >
                        {review.review}
                      </Paragraph>
                      {review.hasReply && !review.isDoctor && (
                        <Button
                          type="text"
                          icon={
                            <img
                              src="https://cdn-icons-png.flaticon.com/128/1933/1933011.png"
                              alt="Doctors Reply"
                              style={{ width: 16, height: 16, marginRight: 4 }}
                            />
                          }
                          size="small"
                          onClick={() => toggleReplyBox(review.id)}
                          style={{
                            height: 'auto',
                            color: '#6b7280',
                            fontSize: 13,
                          }}
                        >
                          {replyStates[review.id]?.showReplyBox ? 'Cancel Reply' : 'Doctors Reply'}
                        </Button>
                      )}
                    </div>
                  </div>
                  {review.replies && review.replies.length > 0 && (
                    <div style={{ marginTop: 16 }}>{review.replies.map((reply) => renderReply(reply))}</div>
                  )}
                  {replyStates[review.id]?.showReplyBox && (
                    <div
                      style={{
                        marginLeft: 52,
                        marginTop: 5,
                        padding: 15,
                        borderRadius: 10,
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
                          Doctors Reply
                        </Text>
                      </div>
                      <TextArea
                        placeholder="Write your reply here..."
                        value={replyStates[review.id]?.replyText || ''}
                        onChange={(e) => handleReplyChange(review.id, e.target.value)}
                        rows={3}
                        style={{ marginBottom: 10 }}
                      />
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button size="small" onClick={() => cancelReply(review.id)}>
                          Cancel
                        </Button>
                        <Button
                          type="primary"
                          size="small"
                          icon={<SendOutlined />}
                          onClick={() => submitReply(review.id)}
                        >
                          Post Reply
                        </Button>
                      </div>
                    </div>
                  )}
                  {index < reviews.length - 1 && <Divider style={{ margin: '20px 0' }} />}
                </div>
              );
            })
          )}
        </Space>
      </Card>
    </div>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Title level={3}>Something went wrong</Title>
          <Paragraph>{this.state.error?.message || 'An unexpected error occurred'}</Paragraph>
          <Button type="primary" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default () => (
  <ErrorBoundary>
    <ReviewsComponent />
  </ErrorBoundary>
);
import React, { useState, useEffect } from 'react';
import { Card, Rate, Avatar, Button, Typography, Space, Divider, Input, message, Spin } from 'antd';
import { MessageOutlined, CalendarOutlined, SendOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { apiGet, apiPost } from '../../api';
import '../../stylings/ReviewsComponent.css'; // We'll create this CSS file

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewsComponent = () => {
  const user = useSelector((state) => state.currentUserData);
  const doctorId = user?.role === 'doctor' ? user?.userId : user?.createdBy;
  const [reviews, setReviews] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overallRating, setOverallRating] = useState(0);
  const [submitting, setSubmitting] = useState({});
  const [expandedReview, setExpandedReview] = useState(null);

  // Fetch token from localStorage
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = localStorage.getItem('accessToken');
        setToken(storedToken);
      } catch (error) {
        console.error('Error fetching token:', error);
        message.error('Failed to retrieve authentication token');
      }
    };
    fetchToken();
  }, []);

  // Fetch reviews and conversations from API
  useEffect(() => {
    const fetchReviews = async () => {
      if (!token || !doctorId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await apiGet(`users/getFeedbackByDoctorId/${doctorId}`);
        
        if (response.status === 200 && response.data?.doctor) {
          const doctorData = response.data.doctor;
          setOverallRating(doctorData.overallRating || 0);

          // Map the feedback array to reviews and fetch conversations for each
          const feedbackArray = doctorData.feedback || [];
          const formattedReviews = await Promise.all(
            feedbackArray.map(async (feedback) => {
              // Fetch conversation for this feedback
              let conversation = [];
              try {
                const convResponse = await apiGet(`users/getFeedbackById/${feedback.feedbackId || feedback.id}`);
                
                if (convResponse.status === 200 && convResponse.data?.feedback) {
                  conversation = convResponse.data.feedback.conversation || [];
                }
              } catch (error) {
                console.error('Error fetching conversation:', error);
              }

              return {
                id: feedback.feedbackId || feedback.id,
                name: feedback.patientName || 'Anonymous Patient',
                date: feedback.createdAt || 'N/A',
                rating: feedback.rating || 0,
                review: feedback.comment || 'No review provided',
                conversation: conversation,
              };
            })
          );
          
          setReviews(formattedReviews);
        } else {
          message.error(response.data?.message || 'Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        message.error(error.response?.data?.message || 'Failed to fetch reviews');
      }
      setLoading(false);
    };

    if (token && doctorId) {
      fetchReviews();
    }
  }, [token, doctorId]);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle expanded view for reviews
  const toggleExpandedReview = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  // Handle reply text change
  const handleReplyChange = (reviewId, value) => {
    setReplyTexts(prev => ({
      ...prev,
      [reviewId]: value
    }));
  };

  // Handle submitting a doctor's reply
  const handleSubmitReply = async (reviewId) => {
    if (!replyTexts[reviewId] || replyTexts[reviewId].trim() === '') {
      message.warning('Please enter a reply message');
      return;
    }

    const payload = {
      feedbackId: reviewId,
      message: replyTexts[reviewId].trim(),
    };

    setSubmitting(prev => ({ ...prev, [reviewId]: true }));

    try {
      const response = await apiPost('users/submitDoctorReply', payload);

      if (response.data.status === 'success') {
        // Refresh the conversation for this specific review
        try {
          const convResponse = await apiGet(`users/getFeedbackById/${reviewId}`);
          
          if (convResponse.status === 200 && convResponse.data?.feedback) {
            setReviews(prevReviews => 
              prevReviews.map(review => 
                review.id === reviewId 
                  ? { ...review, conversation: convResponse.data.feedback.conversation || [] }
                  : review
              )
            );
          }
        } catch (error) {
          console.error('Error fetching updated conversation:', error);
        }
        
        setReplyTexts(prev => ({ ...prev, [reviewId]: '' }));
        setExpandedReview(null);
        message.success('Reply posted successfully!');
      } else {
        message.error(response.message?.message || 'Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:',error.response.data.message.message);
      alert(error.response.data.message.message || 'An unexpected error occurred');
    } finally {
      setSubmitting(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Sort conversation chronologically
  const getSortedConversation = (conversation) => {
    return [...conversation].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  // Render conversation messages
  const renderConversation = (conversation) => {
    const sortedConversation = getSortedConversation(conversation || []);
    
    return (
      <div className="conversation-container">
        <div className="conversation-header">
          <div className="timeline-indicator"></div>
          <Text strong>Conversation</Text>
        </div>
        {sortedConversation.map((message, index) => (
          <div key={message._id || index} className="message-container">
            <div className="message-header">
              <div className="message-sender-info">
                {message.sender === 'doctor' ? (
                  <UserOutlined style={{ color: '#3B82F6', marginRight: 6 }} />
                ) : (
                  <UserOutlined style={{ color: '#10B981', marginRight: 6 }} />
                )}
                <Text style={{ 
                  color: message.sender === 'doctor' ? '#3B82F6' : '#10B981',
                  fontWeight: 600,
                  fontSize: 12
                }}>
                  {message.sender === 'doctor' ? 'Dr. Response ' : 'Patient '}
                </Text>
              </div>
              <Text type="secondary" style={{ fontSize: 11 ,paddingLeft: 8}}>
                { formatDate(message.createdAt)}
              </Text>
            </div>
            <Paragraph className="message-text">
              {message.message}
            </Paragraph>
          </div>
        ))}
      </div>
    );
  };

  // Handle case when user is not logged in or data is not loaded
  if (!user || !token) {
    return (
      <div style={{ textAlign: 'center', padding: 24 }}>
        <Title level={3}>Please log in to view reviews</Title>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      {/* Header */}
      <div className="reviews-header">
        <Title level={3} className="header-title">Patient Reviews</Title>
        
      </div>

      {/* Overall Rating Card */}
      <Card className="overall-rating-card">
        <div className="rating-header">
          <div>
            <Title level={4} className="overall-rating-title">Overall Rating</Title>
            <Text type="secondary">{reviews.length} reviews</Text>
          </div>
          <div className="rating-display">
            <Text className="rating-number">{loading ? '0.0' : overallRating.toFixed(1)}</Text>
            <Rate 
              disabled 
              value={Math.round(overallRating)} 
              className="rating-stars" 
            />
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text>Loading reviews...</Text>
        </div>
      ) : reviews.length === 0 ? (
        <div className="empty-container">
          <MessageOutlined style={{ fontSize: 60, color: '#9CA3AF' }} />
          <Title level={4} className="empty-title">No Reviews Yet</Title>
          <Text type="secondary" className="empty-text">
            Patient reviews will appear here once they start leaving feedback.
          </Text>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => {
            const isExpanded = expandedReview === review.id;
            
            return (
              <Card key={review.id} className="review-card">
                {/* Review Header */}
                <div className="review-header">
                  <div className="patient-info">
                    <Avatar 
                      size={40} 
                      icon={<UserOutlined />} 
                      className="patient-avatar"
                    />
                    <div className="patient-details">
                      <Text strong className="patient-name">{review.name}</Text>
                      <Text type="secondary" className="review-date">{formatDate(review.date)}</Text>
                    </div>
                  </div>
                  <div className="rating-container">
                    <Rate disabled value={review.rating} className="review-stars" />
                    <Text className="rating-text">{review.rating}.0</Text>
                  </div>
                </div>

                {/* Initial Patient Review */}
                <div className="initial-review-container">
                  <div className="message-header">
                    <MessageOutlined style={{ color: '#6B7280', marginRight: 6 }} />
                    <Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>Patient Review</Text>
                  </div>
                  <Paragraph className="review-text">{review.review}</Paragraph>
                </div>

                {/* Conversation */}
                {review.conversation && review.conversation.length > 0 && renderConversation(review.conversation)}

                {/* Reply Section */}
                <div className="reply-section">
                  <Button 
                    type="text" 
                    icon={<MessageOutlined />} 
                    onClick={() => toggleExpandedReview(review.id)}
                    className="reply-toggle-button"
                  >
                    {isExpanded ? 'Cancel Reply' : 'Add Reply'}
                  </Button>

                  {isExpanded && (
                    <div className="reply-form">
                      <TextArea
                        placeholder="Write your professional response..."
                        value={replyTexts[review.id] || ''}
                        onChange={(e) => handleReplyChange(review.id, e.target.value)}
                        rows={4}
                        className="reply-input"
                      />
                      <div className="reply-actions">
                        <Button 
                          onClick={() => setExpandedReview(null)}
                          className="cancel-button"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="primary" 
                          icon={<SendOutlined />} 
                          loading={submitting[review.id]}
                          onClick={() => handleSubmitReply(review.id)}
                          className="submit-reply-button"
                        >
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewsComponent;
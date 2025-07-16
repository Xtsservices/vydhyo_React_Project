import React, { useState } from 'react';
import { Card, Rate, Avatar, Button, Typography, Space, Divider, Input, message } from 'antd';
import { MessageOutlined, CalendarOutlined, SendOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ReviewsComponent = () => {
  const [replyStates, setReplyStates] = useState({});
  const [reviews, setReviews] = useState([
    {
      id: 1,
      name: "Rajesh Kumar",
      date: "15 Mar 2024",
      rating: 4,
      avatar: "R",
      avatarColor: "#52c41a",
      review: "Dr. Lakshmi Raman has been my family's trusted doctor for years. Their genuine care and thorough approach to our health concerns make every visit reassuring. Dr. Lakshmi Raman's ability to listen and explain complex health issues in understandable terms is exceptional. We are grateful to have such a dedicated physician by our side",
      hasReply: true,
      replies: []
    },
    {
      id: 2,
      name: "Meera ",
      date: "11 Mar 2024",
      rating: 4,
      avatar: "M",
      review: "I recently completed a series of dental treatments with Dr. Lakshmi Raman, and I couldn't be more pleased with the results. From my very first appointment, Dr. Lakshmi Raman and their team made me feel completely at ease, addressing all of my concerns with patience and understanding. Their state-of-the-art office and the staff's attention to comfort and cleanliness were beyond impressive.",
      hasReply: true,
      replies: [
        {
          id: 'reply-2-1',
          name: "Dr Lakshmi Raman",
          date: "2 days ago",
          // avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
          isDoctor: true,
          review: "Thank you so much for taking the time to share your experience at our dental clinic. We are deeply touched by your kind words and thrilled to hear about the positive impact of your treatment. Our team strives to provide a comfortable, welcoming environment for all our patients, and it's heartening to know we achieved this for you."
        }
      ]
    }
  ]);

  const toggleReplyBox = (reviewId) => {
    setReplyStates(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        showReplyBox: !prev[reviewId]?.showReplyBox,
        replyText: prev[reviewId]?.replyText || ''
      }
    }));
  };

  const handleReplyChange = (reviewId, value) => {
    setReplyStates(prev => ({
      ...prev,
      [reviewId]: {
        ...prev[reviewId],
        replyText: value
      }
    }));
  };

  const submitReply = (reviewId) => {
    const replyText = replyStates[reviewId]?.replyText;
    if (!replyText || replyText.trim() === '') {
      message.warning('Please enter a reply message');
      return;
    }

    const newReply = {
      id: `reply-${reviewId}-${Date.now()}`,
      name: "Dr Lakshmi Raman",
      date: "Just now",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&crop=face",
      isDoctor: true,
      review: replyText.trim()
    };

    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          replies: [...(review.replies || []), newReply]
        };
      }
      return review;
    }));

    // Clear reply state
    setReplyStates(prev => ({
      ...prev,
      [reviewId]: {
        showReplyBox: false,
        replyText: ''
      }
    }));

    message.success('Reply posted successfully!');
  };

  const cancelReply = (reviewId) => {
    setReplyStates(prev => ({
      ...prev,
      [reviewId]: {
        showReplyBox: false,
        replyText: ''
      }
    }));
  };

  const renderReply = (reply) => (
    <div key={reply.id} style={{ 
      marginLeft: 52, 
      marginTop: 16,
      padding: 16,
      backgroundColor: '#f8fafc',
      borderRadius: 8,
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar 
          size={32}
          style={{ 
            backgroundColor: '#1890ff',
            flexShrink: 0
          }}
        >
          {getAvatarContent(reply)}
        </Avatar>
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 8 }}>
            <Text strong style={{ 
              fontSize: 14, 
              color: '#1890ff'
            }}>
              {reply.name}
            </Text>
            <Text 
              type="secondary" 
              style={{ marginLeft: 8, fontSize: 12 }}
            >
              {reply.date}
            </Text>
          </div>
          
          <Paragraph 
            style={{ 
              margin: 0,
              color: '#4b5563',
              lineHeight: 1.5,
              fontSize: 14
            }}
          >
            {reply.review}
          </Paragraph>
        </div>
      </div>
    </div>
  );

  const getAvatarContent = (review) => {
    if (typeof review.avatar === 'string' && review.avatar.startsWith('http')) {
      return <img src={review.avatar} alt={review.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    }
    return review.avatar;
  };

  return (

    
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '0px' }}>
        {/* <Card style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}> */}
        <Title level={3} style={{ marginBottom: 24, color: '#1f2937' }}>
          Reviews
        </Title>
        {/* </Card> */}
        <Divider />
    
      {/* Overall Rating Card */}
      <Card 
        style={{ 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: 10
        }}
      >
        <Title level={3} style={{ marginBottom: 16, color: '#1f2937' }}>
          Overall Rating
        </Title>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
              <Text style={{ fontSize: 32, fontWeight: 600, color: '#1f2937' }}>
                4.0
              </Text>
              <Rate disabled defaultValue={4} style={{ fontSize: 18 }} />
            </div>
            <Text type="secondary" style={{ fontSize: 14 }}>
              {/* Based on {reviews.length} reviews */}
            </Text>
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 6,
            color: '#6b7280',
            fontSize: 14
          }}>
            <CalendarOutlined />
            <Text type="secondary">06/28/2025 - 07/01/2025</Text>
          </div>
        </div>
      </Card>

      {/* Reviews Card */}
      <Card 
        style={{ 
          borderRadius: 12, 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {/* <Title level={3} style={{ marginBottom: 20, color: '#1f2937' }}>
          Reviews 
        </Title> */}

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {reviews.map((review, index) => (
            <div key={review.id}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <Avatar 
                  size={40}
                  style={{ 
                    backgroundColor: review.avatarColor || '#1890ff',
                    flexShrink: 0
                  }}
                >
                  {getAvatarContent(review)}
                </Avatar>
                
                <div style={{ flex: 1, minWidth: 0, backgroundColor: '#F3FFFD' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: 15,
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div>
                      <Text strong style={{ 
                        fontSize: 16, 
                        color: review.isDoctor ? '#1890ff' : '#1f2937' 
                      }}>
                        {review.name}
                      </Text>
                      <Text 
                        type="secondary" 
                        style={{ marginLeft: 8, fontSize: 14 }}
                      >
                        {review.date}
                      </Text>
                    </div>
                    
                    {review.rating && (
                      <Rate 
                        disabled 
                        defaultValue={review.rating} 
                        style={{ fontSize: 14 }}
                      />
                    )}
                  </div>

                  
                  <Paragraph 
                    style={{ 
                      margin: 0, 
                      marginBottom: 12,
                      color: '#4b5563',
                      lineHeight: 1.6
                    }}
                  >
                    {review.review}
                  </Paragraph>
                  
                  {review.hasReply && !review.isDoctor && (
                    <Button 
                      type="text" 
                      icon={<img 
                      src="https://cdn-icons-png.flaticon.com/128/1933/1933011.png" 
                      alt="Doctors Reply" 
                      style={{ width: 16, height: 16, marginRight: 4 }} 
                    />}
                      size="small"
                      onClick={() => toggleReplyBox(review.id)}
                      style={{ 
                        // padding: '4px 8px',
                        height: 'auto',
                        color: '#6b7280',
                        fontSize: 13
                      }}
                    >
                      {replyStates[review.id]?.showReplyBox ? 'Cancel Reply' : 'Doctors Reply'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Display existing replies */}
              {review.replies && review.replies.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  {review.replies.map(reply => renderReply(reply))}
                </div>
              )}

              {/* Reply input box */}
              {replyStates[review.id]?.showReplyBox && (
                <div style={{ 
                  marginLeft: 52, 
                  marginTop: 5,
                  padding: 15,
                //   backgroundColor: '#f0f9ff',
                  borderRadius: 10,
                //   border: '0px rgb(254, 254, 254)'
                }}>
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
                    <Button 
                      size="small"
                      onClick={() => cancelReply(review.id)}
                    >
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
              
              {index < reviews.length - 1 && (
                <Divider style={{ margin: '20px 0' }} />
              )}
            </div>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default ReviewsComponent;
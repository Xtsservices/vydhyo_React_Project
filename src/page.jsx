// import React, { useState } from 'react';
// import { Layout } from 'antd';
// import Header from './LandingPage/header';
// // import Index from './LandingPage/index';
// import TopSpecialities from './LandingPage/TopSpecialities';
// import FeaturedDocs from './LandingPage/FeaturedDocs';
// import WhyChooseUs from './LandingPage/whyChooseUs';
// import ChooseUsSection from './LandingPage/chooseUsSection';
// import FAQs from './LandingPage/FAQs';
// import Download from './LandingPage/Download';
// import Blogs from './LandingPage/blogs';
// import Footer from './LandingPage/footer';
// // import MedicalSpecialtiesCards from './LandingPage/new';
// import ScrollingCarousel from './LandingPage/scrolling';
// import MedicalSpecialtiesCards from "./components/landingPage/topSpecialities/topSpecialities";


// const { Content } = Layout;

// export default function Home() {
//   const [showSearch, setShowSearch] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');

//   const scrollToSection = (sectionId) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <Layout style={{ minHeight: '100vh' }}>
//       <Header
//         showSearch={showSearch}
//         setShowSearch={setShowSearch}
//         searchQuery={searchQuery}
//         setSearchQuery={setSearchQuery}
//       />
      
//       <Content>
//         <Index scrollToSection={scrollToSection} />
//         <TopSpecialities />
//         <ScrollingCarousel />
//         <MedicalSpecialtiesCards />
//         <FeaturedDocs />
//         <WhyChooseUs />
//         <ChooseUsSection />
//         <FAQs />
//         <Download />
//         <Blogs />
//       </Content>
      
//       <Footer />
//     </Layout>
//   );
// }
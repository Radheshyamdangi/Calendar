import React from "react";
import Calendar from "../components/calendar/Calendar";
import Layout from "../components/Layout";

const HomePage: React.FC = () => {
  return (
    <Layout>
      <Calendar />
    </Layout>
  );
};

export default HomePage;

import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout">
      {children}
      <style>{`
        .layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #fafafa;
        }
      `}</style>
    </div>
  );
};

export default Layout;

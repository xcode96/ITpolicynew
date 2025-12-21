import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto flex-shrink-0 bg-surface">
      <div className="container mx-auto py-4 px-6 md:px-8 lg:p-10 pt-0">
        <p className="text-center text-xs text-textMuted">
          © {new Date().getFullYear()} IT Policy Portal. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
// src/Header.js
import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Auth from './Auth'; // Import the Auth component


const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: linear-gradient(to right, #4a25e0, #7a5aff);
  color: white;
  font-size: 18px;
  margin-bottom: 5px;
  top: 0;
  width: 100%;
  height: 60px; /* Define a fixed height */
  z-index: 1000; /* Ensure the header stays on top of other content */
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  gap: 20px;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const Header = () => {
  return (
    <HeaderContainer>
      <Logo>aiD</Logo>
      <Nav>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/my-colleges-spreadsheet">College Spreadsheet</NavLink> {/* Add the new link */}
        <NavLink to="/my-scholarships-spreadsheet">Scholarship Spreadsheet</NavLink> {/* Add the new link */}
        <NavLink to="/upgrade">Upgrade</NavLink> {/* Add the new link */}
        
      </Nav>
      <Auth /> {/* Add the Auth component for the Google Sign-In button */}
    </HeaderContainer>
  );
};

export default Header;

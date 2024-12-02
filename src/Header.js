import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { handleLogin } from './Auth'; 
import { Button } from '/Users/arjungovind/Desktop/ai-D/my-app/src/Components/ui/button.jsx';
import { Sheet, SheetTrigger, SheetContent } from '/Users/arjungovind/Desktop/ai-D/my-app/src/Components/ui/sheet.jsx';
import { Package2, User, ChevronDown } from 'lucide-react'; 
import logoImage from '/Users/arjungovind/Desktop/ai-D/my-app/src/PocketlyLogo.jpg'; 
import { useCombined } from './Components/CollegeContext';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 4rem;
  width: 100%;
  padding: 0 1rem;
  padding-left: 40px;
  background: var(--background);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  color: inherit;
`;

const Nav = styled.nav`
  display: none;
  align-items: center;
  gap: 1.5rem;
  padding-right: 25px;

  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled(Link)`
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
`;

const MobileNav = styled.div`
  display: flex;
  align-items: center;

  @media (min-width: 768px) {
    display: none;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const DropdownContent = styled.div`
  display: ${(props) => (props.show ? 'block' : 'none')};
  position: absolute;
  background-color: white;
  min-width: 160px;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 1;
  border-radius: 4px;
  padding: 0.5rem;
`;

const DropdownItem = styled.div`
  padding: 0.5rem;
  cursor: pointer;
  font-size: 0.875rem;
  color: black;

  &:hover {
    background-color: #f1f1f1;
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const { myColleges } = useCombined();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleProfileClick = () => {
    navigate('/ProfileScreen');
  };

  const handleCollegeClick = (collegeId) => {
    navigate(`/school/${collegeId}`);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <HeaderContainer>
      <Logo to="/">
        {/*<Package2 className="h-6 w-6" />*/}
        <img src={logoImage} alt="Pocketly Logo" className="h-6 w-6" />
        Pocketly
      </Logo>
      <Nav>
        <NavLink to="/">Home</NavLink>
        <DropdownContainer ref={dropdownRef}>
          <DropdownButton onClick={() => setShowDropdown((prev) => !prev)}>
            My Colleges <ChevronDown className="h-4 w-4" />
          </DropdownButton>
          <DropdownContent show={showDropdown}>
            {myColleges && Object.keys(myColleges).length > 0 ? (
              Object.keys(myColleges).map((collegeId) => (
                <DropdownItem
                  key={collegeId}
                  onClick={() => handleCollegeClick(collegeId)}
                >
                  {myColleges[collegeId].Name}
                </DropdownItem>
              ))
            ) : (
              <DropdownItem>No colleges added</DropdownItem>
            )}
          </DropdownContent>
        </DropdownContainer>
        <NavLink to="/my-colleges-spreadsheet">College Spreadsheet</NavLink>
        <NavLink to="/my-scholarships-spreadsheet">Scholarship Spreadsheet</NavLink>
        <NavLink to="/upgrade">Upgrade</NavLink>
        <User className="h-5 w-5 cursor-pointer" onClick={handleProfileClick} />
      </Nav>
      <MobileNav>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <div className="grid gap-4 p-4">
              <Logo to="/" className="text-lg font-semibold">
                <Package2 className="h-6 w-6" />
                Pocketly
              </Logo>
              <nav className="grid gap-2">
                <NavLink to="/">Home</NavLink>
                <DropdownContainer ref={dropdownRef}>
                  <DropdownButton onClick={() => setShowDropdown((prev) => !prev)}>
                    My Colleges <ChevronDown className="h-4 w-4" />
                  </DropdownButton>
                  <DropdownContent show={showDropdown}>
                    {myColleges && Object.keys(myColleges).length > 0 ? (
                      Object.keys(myColleges).map((collegeId) => (
                        <DropdownItem
                          key={collegeId}
                          onClick={() => handleCollegeClick(collegeId)}
                        >
                          {myColleges[collegeId].Name}
                        </DropdownItem>
                      ))
                    ) : (
                      <DropdownItem>No colleges added</DropdownItem>
                    )}
                  </DropdownContent>
                </DropdownContainer>
                <NavLink to="/my-colleges-spreadsheet">College Spreadsheet</NavLink>
                <NavLink to="/my-scholarships-spreadsheet">Scholarship Spreadsheet</NavLink>
                <NavLink to="/upgrade">Upgrade</NavLink>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </MobileNav>
    </HeaderContainer>
  );
};

function ChromeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <line x1="21.17" x2="12" y1="8" y2="8" />
      <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
      <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
    </svg>
  );
}

function MenuIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

export default Header;

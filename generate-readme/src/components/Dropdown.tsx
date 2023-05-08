import React, { useState, useRef, useEffect } from 'react';
import styles from './GithubDropdown.module.scss';

interface DropdownProps {
  avatarUrl: string | undefined;
  username: string | undefined;
}

const Dropdown = ({avatarUrl, username}: DropdownProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuRight, setMenuRight] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleClickOutside = (event: any) => {
    //@ts-ignore
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowMenu(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (showMenu) {
      // @ts-ignore
      const menuRect = dropdownRef?.current?.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const spaceRight = windowWidth - menuRect.right;

      setMenuRight(spaceRight < menuRect.width);
    }
  }, [showMenu]);

  return (
    <div className={"dropdown-container"} ref={dropdownRef}>
      <button className={"dropdown-trigger"} onClick={toggleMenu}>
        <img src={avatarUrl} alt={username} width={24} height={24} />
      </button>
      <div  className={`${"dropdown-menu"} ${menuRight ? "dropdown-menu-right" : ''} ${
          showMenu ? "show" : ''
        }`}>
        <a className={"dropdown-item"} href="#e">
          Item 1
        </a>
        <a className={"dropdown-item"} href="#e">
          Item 2
        </a>
        <a className={"dropdown-item"} href="#e">
          Item 3
        </a>
      </div>
    </div>
  );
};

export default Dropdown;

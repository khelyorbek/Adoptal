import React, { useState } from 'react';
import { Tooltip, Navbar, Link, Switch } from '@nextui-org/react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import LoginProfileToggle from './profile/LoginProfileToggle';
import { NavLink } from "react-router-dom";


const collapseItems = [
  "Cats",
  "Adopt List",
  "My notes",
  "My comments"
];

const Navigation = ({ handleThemeChange, isDark }) => {
  const { activePage, setActivePage } = useState(null);

  return <>
    {/* General Navbar */}
    <Navbar isBordered variant="floating" maxWidth="xl">

      {/* Settings for toggle button */}
      <Navbar.Toggle showIn="sm" />
      {/* Settings for the logo */}
      <Navbar.Brand hideIn={"xs"}>
        <img src='/logo_title.png' alt='adoptal logo' height={'53px'} />
      </Navbar.Brand>

      <Navbar.Brand showIn={"xs"}>
        <img src='/logo.png' alt='adoptal logo' height={'53px'} />
      </Navbar.Brand>

      {/* Basic settings for the hover and design */}
      <Navbar.Content
        enableCursorHighlight
        activeColor="secondary"
        hideIn="sm"
        variant="highlight-rounded"

      >
        {/* Need to implement dynamic routing with isActive functionality */}
        <Navbar.Item
          style={{ height: "unset", fontWeight: "var(--nextui-fontWeights-medium)" }}>
          <NavLink to="/" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            Cats
          </NavLink>
        </Navbar.Item>

        <Navbar.Item
          style={{ height: "unset", fontWeight: "var(--nextui-fontWeights-medium)" }}>
          <NavLink to="/adoptlist" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            Adopt List
          </NavLink>
        </Navbar.Item>

        <Navbar.Item
          style={{ height: "unset", fontWeight: "var(--nextui-fontWeights-medium)" }}>
          <NavLink to="/mynotes" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            My Notes
          </NavLink>
        </Navbar.Item>


        <Navbar.Item
          style={{ height: "unset", fontWeight: "var(--nextui-fontWeights-medium)" }}>
          <NavLink to="/mycomments" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            My Comments
          </NavLink>
        </Navbar.Item>

      </Navbar.Content>

      {/* Right side of the navbar */}
      <Navbar.Content
        css={{
          "@xs": {
            w: "12%",
            jc: "flex-end",
          },
        }}
      >
        {/* Light / Dark theme switch */}
        <Tooltip content="Dark / Light mode" placement="bottom" color="invert">
          <Navbar.Item>
            <Switch
              checked={isDark ? false : true}
              bordered
              shadow
              size="xl"
              color="warning"
              iconOn={<SunIcon filled />}
              iconOff={<MoonIcon filled />}
              onChange={handleThemeChange}
            />
          </Navbar.Item>
        </Tooltip>

        {/* User profile button dropdown */}
        <LoginProfileToggle></LoginProfileToggle>

      </Navbar.Content>

      {/* Expand/collapse menu on the left (For XS and MD screens only) */}
      <Navbar.Collapse>
        <Navbar.CollapseItem
          key="cats">
          <NavLink to="/" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            Cats
          </NavLink>
        </Navbar.CollapseItem>

        <Navbar.CollapseItem
        key="adopt-list">
          <NavLink to="/adoptlist" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            Adopt List
          </NavLink>
        </Navbar.CollapseItem>

        <Navbar.CollapseItem
        key="my-notes">
          <NavLink to="/mynotes" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            My Notes
          </NavLink>
        </Navbar.CollapseItem>

        <Navbar.CollapseItem
        key="my-comments">
          <NavLink to="/mycomments" end
            style={{ color: isDark ? '#D1B1F0' : '#4D1980' }}>
            My Comments
          </NavLink>
        </Navbar.CollapseItem>

      </Navbar.Collapse>
    </Navbar>

  </>
}

export default Navigation;
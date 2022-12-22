// import './App.css';
// 1. import `NextUIProvider` component
import { NextUIProvider } from '@nextui-org/react';
import { Navbar, Link, Text, Avatar, Dropdown, Button, Loading } from '@nextui-org/react';

const collapseItems = [
  "Profile",
  "Dashboard",
  "Activity",
  "Analytics",
  "System",
  "Deployments",
  "My Settings",
  "Team Settings",
  "Help & Feedback",
  "Log Out",
];

function App() {
  // 2. Use at the root of your app
  return (
    <NextUIProvider theme={'darkTheme'}>
      
        <Navbar isBordered variant="sticky">
          <Navbar.Toggle showIn="sm"/>
          <Navbar.Brand
            // css={{
            //   "@sm": {
            //     w: "30%",
            //   },
            // }}
          >
            <img src='/logo_title.png' alt='adoptal logo' height={'53px'} />
            
            {/* <Text size="$2xl" color="inherit" hideIn="sm">           Adoptal
            </Text> */}

          </Navbar.Brand>
          <Navbar.Content
            enableCursorHighlight
            activeColor="secondary"
            hideIn="sm"
            variant="highlight-rounded"
          >
            <Navbar.Link isActive href="#">Cats</Navbar.Link>
            <Navbar.Link href="#">Adopt List</Navbar.Link>
            <Navbar.Link href="#">My notes</Navbar.Link>
            <Navbar.Link href="#">My comments</Navbar.Link>
          </Navbar.Content>
          <Navbar.Content
            css={{
              "@xs": {
                w: "12%",
                jc: "flex-end",
              },
            }}
          >
            <Dropdown placement="bottom-right">
              <Navbar.Item>
                <Dropdown.Trigger>
                  <Avatar
                    bordered
                    zoomed
                    as="button"
                    color="gradient"
                    size="md"
                    src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                  />
                </Dropdown.Trigger>
              </Navbar.Item>
              <Dropdown.Menu
                aria-label="User menu actions"
                color="secondary"
                onAction={(actionKey) => console.log({ actionKey })}
              >
                <Dropdown.Item key="profile" css={{ height: "$18" }}>
                  <Text b color="inherit" css={{ d: "flex" }}>
                    Signed in as
                  </Text>
                  <Text b color="inherit" css={{ d: "flex" }}>
                    zoey@example.com
                  </Text>
                </Dropdown.Item>
                <Dropdown.Item key="settings" withDivider>
                  My Settings
                </Dropdown.Item>
                <Dropdown.Item key="team_settings">Team Settings</Dropdown.Item>
                <Dropdown.Item key="analytics" withDivider>
                  Analytics
                </Dropdown.Item>
                <Dropdown.Item key="system">System</Dropdown.Item>
                <Dropdown.Item key="configurations">Configurations</Dropdown.Item>
                <Dropdown.Item key="help_and_feedback" withDivider>
                  Help & Feedback
                </Dropdown.Item>
                <Dropdown.Item key="logout" withDivider color="error">
                  Log Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Content>
          <Navbar.Collapse>
            {collapseItems.map((item, index) => (
              <Navbar.CollapseItem
                key={item}
                activeColor="secondary"
                css={{
                  color: index === collapseItems.length - 1 ? "$error" : "",
                }}
                isActive={index === 0}
              >
                <Link
                  color="inherit"
                  css={{
                    minWidth: "100%",
                  }}
                  href="#"
                >
                  {item}
                </Link>
              </Navbar.CollapseItem>
            ))}
          </Navbar.Collapse>
        </Navbar>

      <div className="App">
        <header className="App-header">
          <img src='/logo.png' className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          <Button shadow color="gradient" auto rounded>
            <Loading color="currentColor" size="sm" />
            Click me
          </Button>
        </header>
      </div>
    </NextUIProvider>
  );
}

export default App;

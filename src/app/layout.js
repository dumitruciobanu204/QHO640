import './styles/globals.css';
import Navbar from './components/navbar/navbar';

const Layout = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Places To Stay</title>
      </head>
      <body>
        <Navbar /> {/* Include Navbar globally */}
        <main>{children}</main> {/* Page-specific content */}
        <footer>
          {/* Footer content can be added here */}
        </footer>
      </body>
    </html>
  );
};

export default Layout;

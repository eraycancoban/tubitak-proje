import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Router,
} from "react-router-dom";
import "./style.css"
import Home from "./pages/Home";
import User from "./pages/User";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Personel from "./components/Personel_form";
import NewPass from "./pages/NewPass";
import Forgotpass from "./pages/Forgotpass";

const Layout = ()=>{
  return (
    <>
      <Navbar/>
      <Outlet/>
      <Footer/>
    </>
  )
}



const router = createBrowserRouter([
  {
    element: <Layout/>,
    children: [
      {
        path: "/",
        element: <Home/>,
      },
      {
        path:"/user",
        element: <User/>,
      },
      {
        path:"/chat",
        element: <Chat/>,
      },
      {
        path:"/admin",
        element: <Admin/>,
      },
      {
        path:"/about",
        element:<About/>,
      },
      {
        path:"/contact",
        element:<Contact/>,
      },
      {
        path:"/login",
        element:<Login/>,
      },
      {
        path:"/personel",
        element:<Personel/>,
      },
      {
        path:"/register",
        element:<Register/>,
      },
      {
        path:"/newpass/:token",
        element:<NewPass/>,
      },
      {
        path:"/forgetpass",
        element:<Forgotpass/>,
      },
    ],
  }
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router}/>
    </div>
  );
}

export default App;

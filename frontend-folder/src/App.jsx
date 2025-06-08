import { Route, Routes, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import PageTransition from './components/PageTransition';
import Searchbar from './components/Searchbar';
import About from './pages/About';
import Cart from './pages/Cart';
import Collection from './pages/Collection';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Login from './pages/Login';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import PlaceOrder from './pages/PlaceOrder';
import Product from './pages/Product';
import Profile from './pages/Profile';

const App = () => {
  const location = useLocation();

  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <Searchbar />
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={
          <PageTransition>
            <Home/>
          </PageTransition>
        }/>
        <Route path='/collection' element={
          <PageTransition>
            <Collection/>
          </PageTransition>
        }/>
        <Route path='/about' element={
          <PageTransition>
            <About/>
          </PageTransition>
        }/>
        <Route path='/contact' element={
          <PageTransition>
            <Contact/>
          </PageTransition>
        }/>
        <Route path='/product/:productId' element={
          <PageTransition>
            <Product/>
          </PageTransition>
        }/>
        <Route path='/cart' element={
          <PageTransition>
            <Cart/>
          </PageTransition>
        }/>
        <Route path='/profile' element={
          <PageTransition>
            <Profile/>
          </PageTransition>
        }/>
        <Route path='/login' element={
          <PageTransition>
            <Login/>
          </PageTransition>
        }/>
        <Route path='/place-order' element={
          <PageTransition>
            <PlaceOrder/>
          </PageTransition>
        }/>
        <Route path='/orders' element={
          <PageTransition>
            <Orders/>
          </PageTransition>
        }/>
        <Route path='/order-detail/:orderId' element={
          <PageTransition>
            <OrderDetail/>
          </PageTransition>
        }/>
      </Routes>
      <Footer/>
    </div>
  );
};

export default App;

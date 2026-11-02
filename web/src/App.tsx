// App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import Service from "./pages/Service";
import Flow from "./pages/Flow";
import TermsOfService from "./pages/TermsOfService";
import Privacy from "./pages/Privacy";
import Faq from "./pages/Faq";
import Recruit from "./pages/Recruit";
import Layout from "./components/Layout";
import Philosophy from "./pages/Philosophy";
// ↓ 追加ページ
import Pricing from "./pages/Pricing";
import ForProviders from "./pages/ForProviders";
import LegalNotice from "./pages/LegalNotice";
import News from "./pages/News";
import Testimonials from "./pages/Testimonials";
import SecurityPolicy from "./pages/SecurityPolicy";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          {/* 既存ルート */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<Philosophy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/service" element={<Service />} />
          <Route path="/flow" element={<Flow />} />
          <Route path="/termsOfService" element={<TermsOfService />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/recruit" element={<Recruit />} />
          {/* 追加ルート */}
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/for-providers" element={<ForProviders />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/news" element={<News />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/security" element={<SecurityPolicy />} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
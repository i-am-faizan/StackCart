import { Link } from "react-router-dom";

const NotFoundPage = () => (
  <section className="container section">
    <h1>404</h1>
    <p>The page you requested does not exist.</p>
    <Link className="btn btn-primary" to="/">
      Go to Home
    </Link>
  </section>
);

export default NotFoundPage;


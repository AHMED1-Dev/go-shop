import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../../conponents/FormField";
import { useForm } from "../../conponents/useForm";
import { required, email, minLength } from "../../conponents/validators";

const rules = {
  email: [required("Email"), email],
  password: [required("Password"), minLength("Password", 8)],
};

function SignIn() {
  const navigate = useNavigate();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    rules,
  );

  const onSignIn = () => {
    toast("Sign in will work once the backend is ready.", { icon: "🚧" });
    navigate("/");
  };

  return (
    <section className="w-[90%] max-w-md mx-auto! py-12!">
      <div className="bg-white border border-border rounded-2xl p-6! sm:p-8!">
        <h1 className="text-2xl font-bold text-main! mb-1!">Welcome back</h1>
        <p className="text-sm text-secondary! mb-6!">Sign in to your account</p>

        <form onSubmit={handleSubmit(onSignIn)} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="••••••••"
          />

          <button
            type="submit"
            className="w-full mt-2! py-3! bg-main text-white! rounded-xl font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm text-secondary! text-center mt-5!">
          Don't have an account?{" "}
          <Link to="/register" className="text-main! font-semibold">
            Register
          </Link>
        </p>
      </div>
    </section>
  );
}

export default SignIn;

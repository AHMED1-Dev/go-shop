import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../../conponents/FormField";
import { useForm } from "../../conponents/useForm";
import { required, email, minLength } from "../../conponents/validators";

const matchPassword = (value, allValues) =>
  value === allValues.password ? "" : "Passwords do not match";

const rules = {
  name: [required("Name")],
  email: [required("Email"), email],
  password: [required("Password"), minLength("Password", 8)],
  confirmPassword: [required("Confirm password"), matchPassword],
};

function Register() {
  const navigate = useNavigate();
  // navigate بنجيب دالة التنقل ونسميها
  const { values, errors, handleChange, handleSubmit } = useForm(
    { name: "", email: "", password: "", confirmPassword: "" },
    rules,
  );

  const onRegister = () => {
    toast("Registration will work once the backend is ready.", { icon: "🚧" });
    navigate("/signin");
  };

  return (
    <section className="w-[90%] max-w-md mx-auto! py-12!">
      <div className="bg-white border border-border rounded-2xl p-6! sm:p-8!">
        <h1 className="text-2xl font-bold text-main! mb-1!">Create account</h1>
        <p className="text-sm text-secondary! mb-6!">Join GoShop today</p>

        <form onSubmit={handleSubmit(onRegister)} noValidate>
          <FormField
            label="Full name"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Your name"
          />
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
            placeholder="At least 8 characters"
          />
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Repeat password"
          />

          <button
            type="submit"
            className="w-full mt-2! py-3! bg-main text-white! rounded-xl font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-secondary! text-center mt-5!">
          Already have an account?{" "}
          <Link to="/signin" className="text-main! font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </section>
  );
}

export default Register;

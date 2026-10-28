import toast from "react-hot-toast";
import { FaPhone, FaEnvelope, FaLocationDot, FaClock } from "react-icons/fa6";
import FormField from "../../conponents/FormField";
import { useForm } from "../../conponents/useForm";
import { required, email, minLength } from "../../conponents/validators";

const rules = {
  name: [required("Name")],
  email: [required("Email"), email],
  subject: [required("Subject")],
  message: [required("Message"), minLength("Message", 10)],
};

function Contact() {
  const { values, errors, handleChange, handleSubmit, reset } = useForm(
    { name: "", email: "", subject: "", message: "" },
    rules,
  );
  // console.log(values);

  const onSend = (data) => {
    console.log("Message (no backend yet):", data);
    toast.success("Thanks! We received your message.");
    reset();
  };

  const info = [
    { icon: <FaLocationDot />, label: "Address", text: "Mansoura, Egypt" },
    { icon: <FaPhone />, label: "Phone", text: "+20 100 000 0000" },
    { icon: <FaEnvelope />, label: "Email", text: "support@goshop.com" },
    {
      icon: <FaClock />,
      label: "Working hours",
      text: "Sat - Thu, 9 AM - 6 PM",
    },
  ];

  return (
    <section className="container w-[90%] mx-auto! max-w-337.5 px-4! py-8!">
      <div className="mb-8!">
        <h1 className="text-2xl sm:text-3xl font-bold text-main!">
          Contact Us
        </h1>
        <p className="text-sm text-secondary! mt-1!">
          Have a question? Send us a message and we'll get back to you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info */}
        <div className="space-y-4! lg:col-span-1">
          {info.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-4 bg-white border border-border rounded-2xl p-4!"
            >
              <span className="text-xl text-main! mt-1!">{item.icon}</span>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-sm text-secondary!">{item.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSend)}
          noValidate
          // (type="email" يقول للمتصفح "متعملش التحقق بتاعك" علشان إحنا عاملين تحقق خاص بينا (من غيرها المتصفح هيظهر فقاعاته الخاصة على : noValidate
          className="lg:col-span-2 bg-white border border-border rounded-2xl p-6!"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4!">
            <FormField
              label="Name"
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
          </div>

          <FormField
            label="Subject"
            name="subject"
            value={values.subject}
            onChange={handleChange}
            error={errors.subject}
            placeholder="How can we help?"
          />
          <FormField
            label="Message"
            name="message"
            textarea
            value={values.message}
            onChange={handleChange}
            error={errors.message}
            placeholder="Write your message..."
          />

          <button
            type="submit"
            className="px-8! py-3! bg-main text-white! rounded-xl font-semibold cursor-pointer hover:opacity-90 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;

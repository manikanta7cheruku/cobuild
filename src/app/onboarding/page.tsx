// src/app/onboarding/page.tsx
"use client";

import { FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// step type
type Step = 1 | 2 | 3;

// step names
const STEP_NAMES = ["The Basics", "Role & Skills", "Logistics"] as const;

// roles
const ROLE_OPTIONS = [
  { id: "developer", title: "Developer", subtitle: "Frontend, Backend, Fullstack" },
  { id: "designer", title: "Designer", subtitle: "UI/UX, Product, Graphic" },
  { id: "product", title: "Product Manager", subtitle: "Strategy, Roadmap, Scoping" },
  { id: "marketer", title: "Marketer/Biz", subtitle: "Growth, Sales, Social Media" },
];

// experience
const EXPERIENCE_LEVELS = [
  { id: "beginner", title: "Beginner", subtitle: "Learning" },
  { id: "intermediate", title: "Intermediate", subtitle: "Building" },
  { id: "advanced", title: "Pro / Adv", subtitle: "Shipping" },
];

// availability
const AVAILABILITY_OPTIONS = [
  {
    id: "flexible",
    title: "Flexible / As Needed",
    subtitle: "I'll jump in when I have free time.",
  },
  {
    id: "weekend",
    title: "Weekend Warrior",
    subtitle: "I'm busy during the week, but free on weekends.",
  },
  {
    id: "dedicated",
    title: "Dedicated Project",
    subtitle: "I'm looking to treat this seriously.",
  },
];

type FieldErrors = {
  fullName?: string;
  username?: string;
  university?: string;
  major?: string;
  roles?: string;
  skills?: string;
  about?: string;
  primaryLink?: string;
};

export default function OnboardingPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [step, setStep] = useState<Step>(1);

  // step 1
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");

  // step 2
  const [roles, setRoles] = useState<string[]>([]);
  const [otherRole, setOtherRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState<string>("intermediate");
  const [skills, setSkills] = useState("");
  const [about, setAbout] = useState("");

  // step 3
  const [availability, setAvailability] = useState<string>("weekend");
  const [primaryLink, setPrimaryLink] = useState("");
  const [secondaryLink, setSecondaryLink] = useState("");
  const [showSecondary, setShowSecondary] = useState(false);

  // ui
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const scrollTopRight = () => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleRole = (id: string) => {
    setRoles((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
    setErrors((prev) => ({ ...prev, roles: undefined }));
  };

  const validateStep1 = () => {
    const next: FieldErrors = {};
    if (!fullName.trim()) next.fullName = "This field can't be empty.";
    if (!username.trim()) next.username = "This field can't be empty.";
    if (!university.trim()) next.university = "This field can't be empty.";
    if (!major.trim()) next.major = "This field can't be empty.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: FieldErrors = {};
    if (roles.length === 0 && !otherRole.trim()) {
      next.roles = "Select at least one role or type your own.";
    }
    if (!skills.trim()) next.skills = "This field can't be empty.";
    if (!about.trim()) next.about = "This field can't be empty.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateStep3 = () => {
    const next: FieldErrors = {};
    if (!primaryLink.trim()) next.primaryLink = "This field can't be empty.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNextFromStep1 = () => {
    if (!validateStep1()) {
      scrollTopRight();
      return;
    }
    setStep(2 as Step);
    scrollTopRight();
  };

  const goNextFromStep2 = () => {
    if (!validateStep2()) {
      scrollTopRight();
      return;
    }
    setStep(3 as Step);
    scrollTopRight();
  };

  const goBack = () => {
    if (step === 1) return;
    setStep((s) => (s - 1) as Step);
    scrollTopRight();
  };

    const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateStep3()) {
      scrollTopRight();
      return;
    }

    setLoading(true);
    setApiMessage(null);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          username,
          university,
          major,
          roles,
          otherRole,
          experienceLevel,
          skills,
          about,
          availability,
          primaryLink,
          secondaryLink,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as { message?: string };

      if (!res.ok) {
        setApiMessage(
          data.message ??
            "We couldn’t save your profile right now, but you can still continue."
        );
      } else {
        setApiMessage(data.message ?? "Profile saved.");
      }
    } catch (err) {
      console.error("Unexpected error submitting profile:", err);
      setApiMessage(
        "Something went wrong while saving your profile, but you can still continue."
      );
    } finally {
      setLoading(false);
      setShowSuccess(true);
      scrollTopRight();
    }
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;
  const stepName = STEP_NAMES[step - 1];

  const SuccessView = () => (
    <div className="w-full max-w-[500px]">
      <div className="mb-8 space-y-2">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
          Profile completed
        </p>
        <h2 className="text-3xl font-bold text-slate-900">
          You&apos;re ready to build.
        </h2>
        <p className="text-sm text-slate-500 max-w-md">
          Your Cobuild profile is live. Join squads, contribute to real
          products, and turn campus ideas into launch‑ready MVPs.
        </p>
        {apiMessage && (
          <p className="text-xs text-red-500 mt-1">{apiMessage}</p>
        )}
      </div>
      {/* ... keep the rest of SuccessView and layout exactly as you had it ... */}
      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        className="w-full py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition transform active:scale-[0.99]"
      >
        Continue to dashboard
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white text-slate-900">
      {/* left static column */}
      <div className="hidden lg:flex w-[40%] bg-slate-50 bg-grid-pattern border-r border-slate-200 p-16 flex-col justify-between h-screen sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Cobuild
          </span>
        </div>

        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Let&apos;s build
            <br />
            <span className="text-blue-600">your profile.</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium max-w-sm leading-relaxed">
            Complete your profile to unlock projects and find your squad.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-600 italic mb-4">
            &quot;Finding a co-founder from my own campus was a game
            changer.&quot;
          </p>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
              JD
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">John Doe</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Student @ MIT
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* right scroll column */}
      <div
        ref={scrollRef}
        className="w-full lg:w-[60%] flex flex-col h-screen overflow-y-auto no-scrollbar"
      >
        {/* mobile header */}
        <div className="lg:hidden p-6 flex items-center gap-2 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            C
          </div>
          <span className="text-lg font-bold">Cobuild</span>
        </div>

        {/* content */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-20">
          {showSuccess ? (
            <SuccessView />
          ) : (
            <div className="w-full max-w-[500px]">
              {/* progress */}
              <div className="mb-10">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                  <span>{`Step ${step} of ${totalSteps}`}</span>
                  <span>{stepName}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-900 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                {/* STEP 1 */}
                {step === 1 && (
                  <div className="step-content space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        Who are you?
                      </h2>
                      <p className="text-slate-500">
                        Let&apos;s start with your identity and campus.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* full name */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Sarah Smith"
                          value={fullName}
                          onChange={(e) => {
                            setFullName(e.target.value);
                            if (errors.fullName) {
                              setErrors((prev) => ({
                                ...prev,
                                fullName: undefined,
                              }));
                            }
                          }}
                          className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium ${
                            errors.fullName
                              ? "border-red-400 bg-red-50 focus:ring-red-500"
                              : "border-slate-200 focus:ring-blue-600"
                          }`}
                        />
                        {errors.fullName && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.fullName}
                          </p>
                        )}
                      </div>

                      {/* username */}
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="text-slate-400 font-bold">@</span>
                          </div>
                          <input
                            type="text"
                            placeholder="username"
                            value={username}
                            onChange={(e) => {
                              setUsername(e.target.value);
                              if (errors.username) {
                                setErrors((prev) => ({
                                  ...prev,
                                  username: undefined,
                                }));
                              }
                            }}
                            className={`w-full pl-8 pr-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium ${
                              errors.username
                                ? "border-red-400 bg-red-50 focus:ring-red-500"
                                : "border-slate-200 focus:ring-blue-600"
                            }`}
                          />
                        </div>
                        {errors.username && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.username}
                          </p>
                        )}
                      </div>

                      {/* university + major */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                            University / College
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Stanford"
                            value={university}
                            onChange={(e) => {
                              setUniversity(e.target.value);
                              if (errors.university) {
                                setErrors((prev) => ({
                                  ...prev,
                                  university: undefined,
                                }));
                              }
                            }}
                            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium ${
                              errors.university
                                ? "border-red-400 bg-red-50 focus:ring-red-500"
                                : "border-slate-200 focus:ring-blue-600"
                            }`}
                          />
                          {errors.university && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.university}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                            Major / Year
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. CS - 3rd Year"
                            value={major}
                            onChange={(e) => {
                              setMajor(e.target.value);
                              if (errors.major) {
                                setErrors((prev) => ({
                                  ...prev,
                                  major: undefined,
                                }));
                              }
                            }}
                            className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium ${
                              errors.major
                                ? "border-red-400 bg-red-50 focus:ring-red-500"
                                : "border-slate-200 focus:ring-blue-600"
                            }`}
                          />
                          {errors.major && (
                            <p className="mt-1 text-xs text-red-500">
                              {errors.major}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="step-content space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        Your Expertise
                      </h2>
                      <p className="text-slate-500">
                        Select what you bring to the table.
                      </p>
                    </div>

                    {/* roles */}
                    <div>
                      <div className="flex flex-wrap items-baseline justify-between mb-3 gap-2">
                        <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                          Roles (Select all that apply)
                        </label>
                        <span className="text-[10px] font-medium text-blue-600 italic">
                          We know students are multitalented!
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                        {ROLE_OPTIONS.map((role) => {
                          const selected = roles.includes(role.id);
                          return (
                            <button
                              key={role.id}
                              type="button"
                              onClick={() => toggleRole(role.id)}
                              className={`p-4 rounded-xl border-2 text-left transition ${
                                selected
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <div className="font-bold text-slate-900">
                                {role.title}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {role.subtitle}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.roles && (
                        <p className="mb-2 text-xs text-red-500">
                          {errors.roles}
                        </p>
                      )}
                      <input
                        type="text"
                        placeholder="Other role not listed? Type here."
                        value={otherRole}
                        onChange={(e) => {
                          setOtherRole(e.target.value);
                          if (errors.roles) {
                            setErrors((prev) => ({ ...prev, roles: undefined }));
                          }
                        }}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition text-sm"
                      />
                    </div>

                    {/* experience level */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                        Experience Level
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {EXPERIENCE_LEVELS.map((exp) => {
                          const selected = experienceLevel === exp.id;
                          return (
                            <button
                              key={exp.id}
                              type="button"
                              onClick={() => setExperienceLevel(exp.id)}
                              className={`py-3 px-4 text-center rounded-xl border text-sm transition ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <span className="block font-bold">
                                {exp.title}
                              </span>
                              <span className="block text-xs opacity-80">
                                {exp.subtitle}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* skills */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                        Tech Stack / Skills
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. React, Python, Figma, SEO"
                        value={skills}
                        onChange={(e) => {
                          setSkills(e.target.value);
                          if (errors.skills) {
                            setErrors((prev) => ({ ...prev, skills: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium ${
                          errors.skills
                            ? "border-red-400 bg-red-50 focus:ring-red-500"
                            : "border-slate-200 focus:ring-blue-600"
                        }`}
                      />
                      {errors.skills && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.skills}
                        </p>
                      )}
                    </div>

                    {/* about */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                        About You
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Tell us a bit about yourself..."
                        value={about}
                        onChange={(e) => {
                          setAbout(e.target.value);
                          if (errors.about) {
                            setErrors((prev) => ({ ...prev, about: undefined }));
                          }
                        }}
                        className={`w-full px-4 py-3 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium resize-none ${
                          errors.about
                            ? "border-red-400 bg-red-50 focus:ring-red-500"
                            : "border-slate-200 focus:ring-blue-600"
                        }`}
                      />
                      {errors.about && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.about}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="step-content space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-2">
                        Commitment
                      </h2>
                      <p className="text-slate-500">
                        How much time can you contribute?
                      </p>
                    </div>

                    {/* availability */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
                        Availability
                      </label>

                      {AVAILABILITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAvailability(opt.id)}
                          className={`flex items-center p-4 bg-slate-50 border rounded-xl cursor-pointer transition ${
                            availability === opt.id
                              ? "border-slate-300 bg-slate-100"
                              : "border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name="time"
                            readOnly
                            checked={availability === opt.id}
                            className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500"
                          />
                          <div className="ml-4 text-left">
                            <span className="block font-bold text-slate-900 text-sm">
                              {opt.title}
                            </span>
                            <span className="block text-xs text-slate-500">
                              {opt.subtitle}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* links */}
                    <div>
                      <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                        Show your work
                      </label>
                      <div className="mb-3">
                        <input
                          type="url"
                          placeholder="GitHub / LinkedIn (Required)"
                          value={primaryLink}
                          onChange={(e) => {
                            setPrimaryLink(e.target.value);
                            if (errors.primaryLink) {
                              setErrors((prev) => ({
                                ...prev,
                                primaryLink: undefined,
                              }));
                            }
                          }}
                          className={`w-full px-4 py-3.5 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition font-medium ${
                            errors.primaryLink
                              ? "border-red-400 bg-red-50 focus:ring-red-500"
                              : "border-slate-200 focus:ring-blue-600"
                          }`}
                        />
                        {errors.primaryLink && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.primaryLink}
                          </p>
                        )}
                      </div>

                      {showSecondary && (
                        <div className="mb-3">
                          <input
                            type="url"
                            placeholder="Portfolio / Personal Website / Dribbble"
                            value={secondaryLink}
                            onChange={(e) => setSecondaryLink(e.target.value)}
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition font-medium"
                          />
                        </div>
                      )}

                      {!showSecondary && (
                        <button
                          type="button"
                          onClick={() => setShowSecondary(true)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Add another link (Portfolio/Work)
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* navigation */}
                <div className="flex items-center gap-4 mt-10">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={goBack}
                      className="px-6 py-3.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
                    >
                      Back
                    </button>
                  ) : (
                    <span className="hidden" />
                  )}

                  {step === 1 && (
                    <button
                      type="button"
                      onClick={goNextFromStep1}
                      className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <span>Continue</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  )}

                  {step === 2 && (
                    <button
                      type="button"
                      onClick={goNextFromStep2}
                      className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <span>Continue</span>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </button>
                  )}

                  {step === 3 && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      <span>{loading ? "Saving..." : "Complete Profile"}</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { createHotContext as __vite__createHotContext } from "/@vite/client";import.meta.hot = __vite__createHotContext("/src/context/AppContext.jsx");import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=e03d7169"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import * as RefreshRuntime from "/@react-refresh";
const inWebWorker = typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope;
let prevRefreshReg;
let prevRefreshSig;
if (import.meta.hot && !inWebWorker) {
  if (!window.$RefreshReg$) {
    throw new Error(
      "@vitejs/plugin-react can't detect preamble. Something is wrong."
    );
  }
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = RefreshRuntime.getRefreshReg("C:/Users/Admin/Downloads/SIR-main/SIR-main/src/context/AppContext.jsx");
  window.$RefreshSig$ = RefreshRuntime.createSignatureFunctionForTransform;
}
var _s = $RefreshSig$(), _s2 = $RefreshSig$();
import __vite__cjsImport3_react from "/node_modules/.vite/deps/react.js?v=e03d7169"; const React = __vite__cjsImport3_react.__esModule ? __vite__cjsImport3_react.default : __vite__cjsImport3_react; const createContext = __vite__cjsImport3_react["createContext"]; const useContext = __vite__cjsImport3_react["useContext"]; const useState = __vite__cjsImport3_react["useState"]; const useEffect = __vite__cjsImport3_react["useEffect"];
import { TRANSLATIONS } from "/src/data/translations.js";
import { useCrm } from "/src/crm/context/CrmContext.jsx";
import { supabase } from "/src/supabase.js";
const AppContext = createContext();
export const AppProvider = ({ children }) => {
  _s();
  const crm = useCrm();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("EN");
  const [currency, setCurrency] = useState("AED");
  const [selectedJobCategory, setSelectedJobCategory] = useState("All");
  const t = (key) => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS["EN"]?.[key] || key;
  };
  useEffect(() => {
    if (language === "AR") {
      document.documentElement.setAttribute("dir", "rtl");
      document.documentElement.setAttribute("lang", "ar");
    } else {
      document.documentElement.setAttribute("dir", "ltr");
      document.documentElement.setAttribute("lang", language ? language.toLowerCase() : "en");
    }
  }, [language]);
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname.replace(/^\/+|/ + $ / g, "");
      const hash = window.location.hash.replace("#", "");
      if (path === "crm" || path.startsWith("crm/") || hash === "crm") return "crm";
      if (hash) return hash;
      if (path && path !== "") return path;
    }
    return "home";
  });
  const [selectedJob, setSelectedJob] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [authModalConfig, setAuthModalConfig] = useState({ mode: "login", role: null });
  const openAuthModal = (mode = "login", role = null) => {
    setAuthModalConfig({ mode, role });
    setActiveModal("auth");
  };
  const [savedJobs, setSavedJobs] = useState(["job-101"]);
  const [applications, setApplications] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingInitialData, setLoadingInitialData] = useState(true);
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingInitialData(true);
      try {
        const { data: jobsData, error: jobsError } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
        if (!jobsError && jobsData) {
          setPostedJobs(jobsData);
        }
        const savedUserStr = localStorage.getItem("sir_user_session");
        if (savedUserStr) {
          const savedUser = JSON.parse(savedUserStr);
          if (savedUser && savedUser.email) {
            const { data: profileData, error: profileError } = await supabase.from("profiles").select("*").eq("email", savedUser.email.toLowerCase().trim()).single();
            if (!profileError && profileData) {
              const fullUser = { ...savedUser, ...profileData };
              setUser(fullUser);
              if (fullUser.role === "candidate") {
                const { data: appsData, error: appsError } = await supabase.from("applications").select("*").eq("userEmail", fullUser.email);
                if (!appsError && appsData) setApplications(appsData);
              }
            } else {
              setUser(savedUser);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setLoadingInitialData(false);
      }
    };
    fetchInitialData();
  }, []);
  const saveUserSession = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem("sir_user_session", JSON.stringify(userData));
    } else {
      localStorage.removeItem("sir_user_session");
      setApplications([]);
    }
  };
  const loginCandidate = async (email, password) => {
    const normalizedEmail = (email || "").toLowerCase().trim();
    let { data: candidateUser, error } = await supabase.from("profiles").select("*").eq("email", normalizedEmail).eq("role", "candidate").single();
    if (!candidateUser) {
      candidateUser = {
        name: email.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Executive Candidate",
        email: normalizedEmail,
        role: "candidate",
        candidateId: "Revival International-CAN-" + Math.floor(1e4 + Math.random() * 9e4)
      };
      const { data: newProfile, error: insertError } = await supabase.from("profiles").insert([candidateUser]).select().single();
      if (!insertError && newProfile) candidateUser = newProfile;
    }
    saveUserSession(candidateUser);
    const { data: appsData } = await supabase.from("applications").select("*").eq("userEmail", normalizedEmail);
    if (appsData) setApplications(appsData);
    setActiveTab("candidates");
    return candidateUser;
  };
  const registerCandidate = async (data) => {
    const normalizedEmail = (data.email || "").toLowerCase().trim();
    const candidateUser = {
      name: data.fullName || "",
      email: normalizedEmail,
      phone: data.phone || "",
      title: data.industry || "",
      preferredCountry: data.preferredCountry || "",
      resumeUploaded: !!data.resumeName,
      resumeName: data.resumeName || "",
      role: "candidate",
      candidateId: "Revival International-CAN-" + Math.floor(1e4 + Math.random() * 9e4)
    };
    const { data: profile, error } = await supabase.from("profiles").upsert([candidateUser], { onConflict: "email" }).select().single();
    const finalUser = profile || candidateUser;
    saveUserSession(finalUser);
    setActiveTab("candidates");
    if (crm && crm.addCandidate) {
      crm.addCandidate({
        name: finalUser.name,
        email: finalUser.email,
        phone: finalUser.phone,
        title: finalUser.title,
        status: "Web Lead",
        score: 85,
        stage: "lead"
      });
    }
    return finalUser;
  };
  const updateUserProfile = async (profileData) => {
    if (!user || !user.email) return;
    const updated = { ...user, ...profileData };
    setUser(updated);
    localStorage.setItem("sir_user_session", JSON.stringify(updated));
    await supabase.from("profiles").update(profileData).eq("email", user.email);
    return updated;
  };
  const loginEmployer = async (companyEmail, accountId, password) => {
    const normalizedEmail = (companyEmail || "").toLowerCase().trim();
    let { data: employerUser, error } = await supabase.from("profiles").select("*").eq("email", normalizedEmail).eq("role", "employer").single();
    if (!employerUser) {
      employerUser = {
        name: companyEmail.split("@")[0].replace(".", " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Corporate HR Director",
        companyName: "Al Habtoor Contracting LLC",
        email: normalizedEmail,
        role: "employer",
        mohreAttested: true
      };
      const { data: newEmp } = await supabase.from("profiles").insert([employerUser]).select().single();
      if (newEmp) employerUser = newEmp;
    }
    saveUserSession(employerUser);
    setActiveTab("employers");
    return employerUser;
  };
  const logout = () => {
    saveUserSession(null);
    setActiveTab("home");
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/");
    }
  };
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };
  const toggleSaveJob = (jobId) => {
    setSavedJobs(
      (prev) => prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };
  const applyForJob = async (job) => {
    if (!job || !job.id || !user || !user.email) return;
    const newApp = {
      jobId: job.id,
      userEmail: user.email,
      jobTitle: job.title,
      company: job.company,
      country: job.country,
      appliedDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      status: "Under AI Resume Screening",
      step: 1
    };
    const { data, error } = await supabase.from("applications").insert([newApp]).select().single();
    if (!error && data) {
      setApplications((prev) => [data, ...prev]);
    }
  };
  const updateApplicationStatus = async (appId, newStatus, step) => {
    const { data, error } = await supabase.from("applications").update({ status: newStatus, step }).eq("id", appId).select().single();
    if (!error && data) {
      setApplications((prev) => prev.map((app) => app.id === appId ? data : app));
    }
  };
  useEffect(() => {
    const handleUrlSync = () => {
      const path = window.location.pathname.replace(/^\/+|/ + $ / g, "");
      const hash = window.location.hash.replace("#", "");
      if (path === "crm" || path.startsWith("crm/") || hash === "crm") {
        setActiveTab("crm");
      } else if (hash) {
        setActiveTab(hash);
      } else if (path && path !== "") {
        setActiveTab(path);
      } else {
        setActiveTab("home");
      }
    };
    handleUrlSync();
    window.addEventListener("hashchange", handleUrlSync);
    window.addEventListener("popstate", handleUrlSync);
    return () => {
      window.removeEventListener("hashchange", handleUrlSync);
      window.removeEventListener("popstate", handleUrlSync);
    };
  }, []);
  const addJob = async (jobData) => {
    const newJob = {
      title: jobData.title || "Untitled Role",
      company: user?.companyName || jobData.company || "Al Habtoor Contracting LLC",
      country: jobData.country || "UAE",
      location: jobData.location || `${jobData.country || "UAE"}, Business District`,
      salary: jobData.salary || "Negotiable",
      experience: jobData.experience || "2 - 5 Years",
      jobType: jobData.jobType || "Full-time",
      category: jobData.category || "Construction",
      description: jobData.description || "Job mandate posted via Revival International Employer Portal.",
      vacancies: jobData.vacancies || "5",
      skills: Array.isArray(jobData.skills) ? jobData.skills : jobData.skills ? jobData.skills.split(",").map((s) => s.trim()) : ["Management", "Operations"],
      qualification: jobData.qualification || "Bachelor's Degree",
      benefits: Array.isArray(jobData.benefits) ? jobData.benefits : jobData.benefits ? jobData.benefits.split(",").map((b) => b.trim()) : ["Tax-free salary", "Visa Sponsorship", "Medical Insurance"],
      postedDate: "Just now",
      featured: true
    };
    const { data, error } = await supabase.from("jobs").insert([newJob]).select().single();
    if (!error && data) {
      setPostedJobs((prev) => [data, ...prev]);
    }
    return data;
  };
  const deleteJob = async (jobId) => {
    await supabase.from("jobs").delete().eq("id", jobId);
    setPostedJobs((prev) => prev.filter((j) => j.id !== jobId));
  };
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [selectedIndustryId, setSelectedIndustryId] = useState(null);
  const navigateTo = (tab) => {
    setActiveTab(tab);
    if (tab === "crm") {
      window.history.pushState({}, "", "/crm");
    } else {
      if (window.location.pathname.startsWith("/crm")) {
        window.history.pushState({}, "", "/" + (tab === "home" ? "" : `#${tab}`));
      } else {
        window.location.hash = tab;
      }
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const navigateToService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setActiveTab("services");
    window.location.hash = "services";
    setTimeout(() => {
      const elem = document.getElementById(`service-${serviceId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 120);
  };
  const navigateToIndustry = (industryId) => {
    setSelectedIndustryId(industryId);
    setActiveTab("industries");
    window.location.hash = "industries";
    setTimeout(() => {
      const elem = document.getElementById(`industry-${industryId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 120);
  };
  return /* @__PURE__ */ jsxDEV(
    AppContext.Provider,
    {
      value: {
        darkMode,
        toggleDarkMode,
        language,
        setLanguage,
        t,
        currency,
        setCurrency,
        activeTab,
        navigateTo,
        selectedServiceId,
        setSelectedServiceId,
        selectedIndustryId,
        setSelectedIndustryId,
        navigateToService,
        navigateToIndustry,
        selectedJob,
        setSelectedJob,
        selectedJobCategory,
        setSelectedJobCategory,
        activeModal,
        setActiveModal,
        authModalConfig,
        openAuthModal,
        savedJobs,
        toggleSaveJob,
        applications,
        applyForJob,
        updateApplicationStatus,
        postedJobs,
        addJob,
        deleteJob,
        user,
        setUser,
        updateUserProfile,
        loginCandidate,
        registerCandidate,
        loginEmployer,
        logout,
        loadingInitialData
      },
      children
    },
    void 0,
    false,
    {
      fileName: "C:/Users/Admin/Downloads/SIR-main/SIR-main/src/context/AppContext.jsx",
      lineNumber: 422,
      columnNumber: 5
    },
    this
  );
};
_s(AppProvider, "Z24t6L8GqEdlI9u6GPINpIsZSFI=", false, function() {
  return [useCrm];
});
_c = AppProvider;
export const useApp = () => {
  _s2();
  return useContext(AppContext);
};
_s2(useApp, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
var _c;
$RefreshReg$(_c, "AppProvider");
if (import.meta.hot && !inWebWorker) {
  window.$RefreshReg$ = prevRefreshReg;
  window.$RefreshSig$ = prevRefreshSig;
}
if (import.meta.hot && !inWebWorker) {
  RefreshRuntime.__hmr_import(import.meta.url).then((currentExports) => {
    RefreshRuntime.registerExportsForReactRefresh("C:/Users/Admin/Downloads/SIR-main/SIR-main/src/context/AppContext.jsx", currentExports);
    import.meta.hot.accept((nextExports) => {
      if (!nextExports) return;
      const invalidateMessage = RefreshRuntime.validateRefreshBoundaryAndEnqueueUpdate("C:/Users/Admin/Downloads/SIR-main/SIR-main/src/context/AppContext.jsx", currentExports, nextExports);
      if (invalidateMessage) import.meta.hot.invalidate(invalidateMessage);
    });
  });
}

//# sourceMappingURL=data:application/json;base64,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c2VFZmZlY3QiLCJUUkFOU0xBVElPTlMiLCJ1c2VDcm0iLCJzdXBhYmFzZSIsIkFwcENvbnRleHQiLCJBcHBQcm92aWRlciIsImNoaWxkcmVuIiwiX3MiLCJjcm0iLCJkYXJrTW9kZSIsInNldERhcmtNb2RlIiwibGFuZ3VhZ2UiLCJzZXRMYW5ndWFnZSIsImN1cnJlbmN5Iiwic2V0Q3VycmVuY3kiLCJzZWxlY3RlZEpvYkNhdGVnb3J5Iiwic2V0U2VsZWN0ZWRKb2JDYXRlZ29yeSIsInQiLCJrZXkiLCJkb2N1bWVudCIsImRvY3VtZW50RWxlbWVudCIsInNldEF0dHJpYnV0ZSIsInRvTG93ZXJDYXNlIiwiYWN0aXZlVGFiIiwic2V0QWN0aXZlVGFiIiwid2luZG93IiwicGF0aCIsImxvY2F0aW9uIiwicGF0aG5hbWUiLCJyZXBsYWNlIiwiJCIsImciLCJoYXNoIiwic3RhcnRzV2l0aCIsInNlbGVjdGVkSm9iIiwic2V0U2VsZWN0ZWRKb2IiLCJhY3RpdmVNb2RhbCIsInNldEFjdGl2ZU1vZGFsIiwiYXV0aE1vZGFsQ29uZmlnIiwic2V0QXV0aE1vZGFsQ29uZmlnIiwibW9kZSIsInJvbGUiLCJvcGVuQXV0aE1vZGFsIiwic2F2ZWRKb2JzIiwic2V0U2F2ZWRKb2JzIiwiYXBwbGljYXRpb25zIiwic2V0QXBwbGljYXRpb25zIiwicG9zdGVkSm9icyIsInNldFBvc3RlZEpvYnMiLCJ1c2VyIiwic2V0VXNlciIsImxvYWRpbmdJbml0aWFsRGF0YSIsInNldExvYWRpbmdJbml0aWFsRGF0YSIsImZldGNoSW5pdGlhbERhdGEiLCJkYXRhIiwiam9ic0RhdGEiLCJlcnJvciIsImpvYnNFcnJvciIsImZyb20iLCJzZWxlY3QiLCJvcmRlciIsImFzY2VuZGluZyIsInNhdmVkVXNlclN0ciIsImxvY2FsU3RvcmFnZSIsImdldEl0ZW0iLCJzYXZlZFVzZXIiLCJKU09OIiwicGFyc2UiLCJlbWFpbCIsInByb2ZpbGVEYXRhIiwicHJvZmlsZUVycm9yIiwiZXEiLCJ0cmltIiwic2luZ2xlIiwiZnVsbFVzZXIiLCJhcHBzRGF0YSIsImFwcHNFcnJvciIsImVyciIsImNvbnNvbGUiLCJzYXZlVXNlclNlc3Npb24iLCJ1c2VyRGF0YSIsInNldEl0ZW0iLCJzdHJpbmdpZnkiLCJyZW1vdmVJdGVtIiwibG9naW5DYW5kaWRhdGUiLCJwYXNzd29yZCIsIm5vcm1hbGl6ZWRFbWFpbCIsImNhbmRpZGF0ZVVzZXIiLCJuYW1lIiwic3BsaXQiLCJjIiwidG9VcHBlckNhc2UiLCJjYW5kaWRhdGVJZCIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsIm5ld1Byb2ZpbGUiLCJpbnNlcnRFcnJvciIsImluc2VydCIsInJlZ2lzdGVyQ2FuZGlkYXRlIiwiZnVsbE5hbWUiLCJwaG9uZSIsInRpdGxlIiwiaW5kdXN0cnkiLCJwcmVmZXJyZWRDb3VudHJ5IiwicmVzdW1lVXBsb2FkZWQiLCJyZXN1bWVOYW1lIiwicHJvZmlsZSIsInVwc2VydCIsIm9uQ29uZmxpY3QiLCJmaW5hbFVzZXIiLCJhZGRDYW5kaWRhdGUiLCJzdGF0dXMiLCJzY29yZSIsInN0YWdlIiwidXBkYXRlVXNlclByb2ZpbGUiLCJ1cGRhdGVkIiwidXBkYXRlIiwibG9naW5FbXBsb3llciIsImNvbXBhbnlFbWFpbCIsImFjY291bnRJZCIsImVtcGxveWVyVXNlciIsImNvbXBhbnlOYW1lIiwibW9ocmVBdHRlc3RlZCIsIm5ld0VtcCIsImxvZ291dCIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJ0b2dnbGVEYXJrTW9kZSIsInByZXYiLCJuZXh0IiwiY2xhc3NMaXN0IiwiYWRkIiwicmVtb3ZlIiwidG9nZ2xlU2F2ZUpvYiIsImpvYklkIiwiaW5jbHVkZXMiLCJmaWx0ZXIiLCJpZCIsImFwcGx5Rm9ySm9iIiwiam9iIiwibmV3QXBwIiwidXNlckVtYWlsIiwiam9iVGl0bGUiLCJjb21wYW55IiwiY291bnRyeSIsImFwcGxpZWREYXRlIiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwic3RlcCIsInVwZGF0ZUFwcGxpY2F0aW9uU3RhdHVzIiwiYXBwSWQiLCJuZXdTdGF0dXMiLCJtYXAiLCJhcHAiLCJoYW5kbGVVcmxTeW5jIiwiYWRkRXZlbnRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJhZGRKb2IiLCJqb2JEYXRhIiwibmV3Sm9iIiwic2FsYXJ5IiwiZXhwZXJpZW5jZSIsImpvYlR5cGUiLCJjYXRlZ29yeSIsImRlc2NyaXB0aW9uIiwidmFjYW5jaWVzIiwic2tpbGxzIiwiQXJyYXkiLCJpc0FycmF5IiwicyIsInF1YWxpZmljYXRpb24iLCJiZW5lZml0cyIsImIiLCJwb3N0ZWREYXRlIiwiZmVhdHVyZWQiLCJkZWxldGVKb2IiLCJkZWxldGUiLCJqIiwic2VsZWN0ZWRTZXJ2aWNlSWQiLCJzZXRTZWxlY3RlZFNlcnZpY2VJZCIsInNlbGVjdGVkSW5kdXN0cnlJZCIsInNldFNlbGVjdGVkSW5kdXN0cnlJZCIsIm5hdmlnYXRlVG8iLCJ0YWIiLCJzY3JvbGxUbyIsInRvcCIsImJlaGF2aW9yIiwibmF2aWdhdGVUb1NlcnZpY2UiLCJzZXJ2aWNlSWQiLCJzZXRUaW1lb3V0IiwiZWxlbSIsImdldEVsZW1lbnRCeUlkIiwic2Nyb2xsSW50b1ZpZXciLCJibG9jayIsIm5hdmlnYXRlVG9JbmR1c3RyeSIsImluZHVzdHJ5SWQiLCJ1c2VBcHAiLCJfczIiLCJfYyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlcyI6WyJBcHBDb250ZXh0LmpzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgY3JlYXRlQ29udGV4dCwgdXNlQ29udGV4dCwgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IFRSQU5TTEFUSU9OUyB9IGZyb20gJy4uL2RhdGEvdHJhbnNsYXRpb25zJztcbmltcG9ydCB7IHVzZUNybSB9IGZyb20gJy4uL2NybS9jb250ZXh0L0NybUNvbnRleHQnO1xuaW1wb3J0IHsgc3VwYWJhc2UgfSBmcm9tICcuLi9zdXBhYmFzZSc7XG5cbmNvbnN0IEFwcENvbnRleHQgPSBjcmVhdGVDb250ZXh0KCk7XG5cbmV4cG9ydCBjb25zdCBBcHBQcm92aWRlciA9ICh7IGNoaWxkcmVuIH0pID0+IHtcbiAgY29uc3QgY3JtID0gdXNlQ3JtKCk7XG4gIGNvbnN0IFtkYXJrTW9kZSwgc2V0RGFya01vZGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbbGFuZ3VhZ2UsIHNldExhbmd1YWdlXSA9IHVzZVN0YXRlKCdFTicpO1xuICBjb25zdCBbY3VycmVuY3ksIHNldEN1cnJlbmN5XSA9IHVzZVN0YXRlKCdBRUQnKTtcbiAgY29uc3QgW3NlbGVjdGVkSm9iQ2F0ZWdvcnksIHNldFNlbGVjdGVkSm9iQ2F0ZWdvcnldID0gdXNlU3RhdGUoJ0FsbCcpO1xuXG4gIGNvbnN0IHQgPSAoa2V5KSA9PiB7XG4gICAgcmV0dXJuIFRSQU5TTEFUSU9OU1tsYW5ndWFnZV0/LltrZXldIHx8IFRSQU5TTEFUSU9OU1snRU4nXT8uW2tleV0gfHwga2V5O1xuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKGxhbmd1YWdlID09PSAnQVInKSB7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkaXInLCAncnRsJyk7XG4gICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdsYW5nJywgJ2FyJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2RpcicsICdsdHInKTtcbiAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2xhbmcnLCBsYW5ndWFnZSA/IGxhbmd1YWdlLnRvTG93ZXJDYXNlKCkgOiAnZW4nKTtcbiAgICB9XG4gIH0sIFtsYW5ndWFnZV0pO1xuXG4gIGNvbnN0IFthY3RpdmVUYWIsIHNldEFjdGl2ZVRhYl0gPSB1c2VTdGF0ZSgoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zdCBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnJlcGxhY2UoL15cXC8rfC8rJC9nLCAnJyk7XG4gICAgICBjb25zdCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsICcnKTtcbiAgICAgIGlmIChwYXRoID09PSAnY3JtJyB8fCBwYXRoLnN0YXJ0c1dpdGgoJ2NybS8nKSB8fCBoYXNoID09PSAnY3JtJykgcmV0dXJuICdjcm0nO1xuICAgICAgaWYgKGhhc2gpIHJldHVybiBoYXNoO1xuICAgICAgaWYgKHBhdGggJiYgcGF0aCAhPT0gJycpIHJldHVybiBwYXRoO1xuICAgIH1cbiAgICByZXR1cm4gJ2hvbWUnO1xuICB9KTtcblxuICBjb25zdCBbc2VsZWN0ZWRKb2IsIHNldFNlbGVjdGVkSm9iXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbYWN0aXZlTW9kYWwsIHNldEFjdGl2ZU1vZGFsXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbYXV0aE1vZGFsQ29uZmlnLCBzZXRBdXRoTW9kYWxDb25maWddID0gdXNlU3RhdGUoeyBtb2RlOiAnbG9naW4nLCByb2xlOiBudWxsIH0pO1xuXG4gIGNvbnN0IG9wZW5BdXRoTW9kYWwgPSAobW9kZSA9ICdsb2dpbicsIHJvbGUgPSBudWxsKSA9PiB7XG4gICAgc2V0QXV0aE1vZGFsQ29uZmlnKHsgbW9kZSwgcm9sZSB9KTtcbiAgICBzZXRBY3RpdmVNb2RhbCgnYXV0aCcpO1xuICB9O1xuXG4gIGNvbnN0IFtzYXZlZEpvYnMsIHNldFNhdmVkSm9ic10gPSB1c2VTdGF0ZShbJ2pvYi0xMDEnXSk7XG4gIFxuICAvLyBTdXBhYmFzZSBTdGF0ZVxuICBjb25zdCBbYXBwbGljYXRpb25zLCBzZXRBcHBsaWNhdGlvbnNdID0gdXNlU3RhdGUoW10pO1xuICBjb25zdCBbcG9zdGVkSm9icywgc2V0UG9zdGVkSm9ic10gPSB1c2VTdGF0ZShbXSk7XG4gIGNvbnN0IFt1c2VyLCBzZXRVc2VyXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbbG9hZGluZ0luaXRpYWxEYXRhLCBzZXRMb2FkaW5nSW5pdGlhbERhdGFdID0gdXNlU3RhdGUodHJ1ZSk7XG5cbiAgLy8gRmV0Y2ggaW5pdGlhbCBkYXRhIGZyb20gU3VwYWJhc2VcbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBjb25zdCBmZXRjaEluaXRpYWxEYXRhID0gYXN5bmMgKCkgPT4ge1xuICAgICAgc2V0TG9hZGluZ0luaXRpYWxEYXRhKHRydWUpO1xuICAgICAgXG4gICAgICB0cnkge1xuICAgICAgICAvLyBGZXRjaCBKb2JzXG4gICAgICAgIGNvbnN0IHsgZGF0YTogam9ic0RhdGEsIGVycm9yOiBqb2JzRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2pvYnMnKS5zZWxlY3QoJyonKS5vcmRlcignY3JlYXRlZF9hdCcsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KTtcbiAgICAgICAgaWYgKCFqb2JzRXJyb3IgJiYgam9ic0RhdGEpIHtcbiAgICAgICAgICBzZXRQb3N0ZWRKb2JzKGpvYnNEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlY292ZXIgVXNlciBTZXNzaW9uIGZyb20gbG9jYWxTdG9yYWdlLCB0aGVuIGZldGNoIGZyZXNoIHByb2ZpbGUgZnJvbSBEQlxuICAgICAgICBjb25zdCBzYXZlZFVzZXJTdHIgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc2lyX3VzZXJfc2Vzc2lvbicpO1xuICAgICAgICBpZiAoc2F2ZWRVc2VyU3RyKSB7XG4gICAgICAgICAgY29uc3Qgc2F2ZWRVc2VyID0gSlNPTi5wYXJzZShzYXZlZFVzZXJTdHIpO1xuICAgICAgICAgIGlmIChzYXZlZFVzZXIgJiYgc2F2ZWRVc2VyLmVtYWlsKSB7XG4gICAgICAgICAgICBjb25zdCB7IGRhdGE6IHByb2ZpbGVEYXRhLCBlcnJvcjogcHJvZmlsZUVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAgICAgICAuZnJvbSgncHJvZmlsZXMnKVxuICAgICAgICAgICAgICAuc2VsZWN0KCcqJylcbiAgICAgICAgICAgICAgLmVxKCdlbWFpbCcsIHNhdmVkVXNlci5lbWFpbC50b0xvd2VyQ2FzZSgpLnRyaW0oKSlcbiAgICAgICAgICAgICAgLnNpbmdsZSgpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghcHJvZmlsZUVycm9yICYmIHByb2ZpbGVEYXRhKSB7XG4gICAgICAgICAgICAgIGNvbnN0IGZ1bGxVc2VyID0geyAuLi5zYXZlZFVzZXIsIC4uLnByb2ZpbGVEYXRhIH07XG4gICAgICAgICAgICAgIHNldFVzZXIoZnVsbFVzZXIpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgLy8gRmV0Y2ggVXNlcidzIEFwcGxpY2F0aW9ucyBpZiB0aGV5IGFyZSBhIGNhbmRpZGF0ZVxuICAgICAgICAgICAgICBpZiAoZnVsbFVzZXIucm9sZSA9PT0gJ2NhbmRpZGF0ZScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IGRhdGE6IGFwcHNEYXRhLCBlcnJvcjogYXBwc0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxuICAgICAgICAgICAgICAgICAgLmZyb20oJ2FwcGxpY2F0aW9ucycpXG4gICAgICAgICAgICAgICAgICAuc2VsZWN0KCcqJylcbiAgICAgICAgICAgICAgICAgIC5lcSgndXNlckVtYWlsJywgZnVsbFVzZXIuZW1haWwpO1xuICAgICAgICAgICAgICAgIGlmICghYXBwc0Vycm9yICYmIGFwcHNEYXRhKSBzZXRBcHBsaWNhdGlvbnMoYXBwc0RhdGEpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZXRVc2VyKHNhdmVkVXNlcik7IC8vIGZhbGxiYWNrXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgaW5pdGlhbCBkYXRhOicsIGVycik7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBzZXRMb2FkaW5nSW5pdGlhbERhdGEoZmFsc2UpO1xuICAgICAgfVxuICAgIH07XG4gICAgXG4gICAgZmV0Y2hJbml0aWFsRGF0YSgpO1xuICB9LCBbXSk7XG5cbiAgY29uc3Qgc2F2ZVVzZXJTZXNzaW9uID0gKHVzZXJEYXRhKSA9PiB7XG4gICAgc2V0VXNlcih1c2VyRGF0YSk7XG4gICAgaWYgKHVzZXJEYXRhKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnc2lyX3VzZXJfc2Vzc2lvbicsIEpTT04uc3RyaW5naWZ5KHVzZXJEYXRhKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzaXJfdXNlcl9zZXNzaW9uJyk7XG4gICAgICBzZXRBcHBsaWNhdGlvbnMoW10pOyAvLyBDbGVhciBhcHBzIG9uIGxvZ291dFxuICAgIH1cbiAgfTtcblxuICBjb25zdCBsb2dpbkNhbmRpZGF0ZSA9IGFzeW5jIChlbWFpbCwgcGFzc3dvcmQpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemVkRW1haWwgPSAoZW1haWwgfHwgJycpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgIC8vIENoZWNrIFN1cGFiYXNlIERCXG4gICAgbGV0IHsgZGF0YTogY2FuZGlkYXRlVXNlciwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgncHJvZmlsZXMnKVxuICAgICAgLnNlbGVjdCgnKicpXG4gICAgICAuZXEoJ2VtYWlsJywgbm9ybWFsaXplZEVtYWlsKVxuICAgICAgLmVxKCdyb2xlJywgJ2NhbmRpZGF0ZScpXG4gICAgICAuc2luZ2xlKCk7XG5cbiAgICBpZiAoIWNhbmRpZGF0ZVVzZXIpIHtcbiAgICAgIC8vIENyZWF0ZSBuZXcgcHJvZmlsZSBpZiBkb2Vzbid0IGV4aXN0XG4gICAgICBjYW5kaWRhdGVVc2VyID0ge1xuICAgICAgICBuYW1lOiBlbWFpbC5zcGxpdCgnQCcpWzBdLnJlcGxhY2UoJy4nLCAnICcpLnJlcGxhY2UoL1xcYlxcdy9nLCBjID0+IGMudG9VcHBlckNhc2UoKSkgfHwgJ0V4ZWN1dGl2ZSBDYW5kaWRhdGUnLFxuICAgICAgICBlbWFpbDogbm9ybWFsaXplZEVtYWlsLFxuICAgICAgICByb2xlOiAnY2FuZGlkYXRlJyxcbiAgICAgICAgY2FuZGlkYXRlSWQ6ICdSZXZpdmFsIEludGVybmF0aW9uYWwtQ0FOLScgKyBNYXRoLmZsb29yKDEwMDAwICsgTWF0aC5yYW5kb20oKSAqIDkwMDAwKSxcbiAgICAgIH07XG4gICAgICBjb25zdCB7IGRhdGE6IG5ld1Byb2ZpbGUsIGVycm9yOiBpbnNlcnRFcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgICAgLmZyb20oJ3Byb2ZpbGVzJylcbiAgICAgICAgLmluc2VydChbY2FuZGlkYXRlVXNlcl0pXG4gICAgICAgIC5zZWxlY3QoKVxuICAgICAgICAuc2luZ2xlKCk7XG4gICAgICAgIFxuICAgICAgaWYgKCFpbnNlcnRFcnJvciAmJiBuZXdQcm9maWxlKSBjYW5kaWRhdGVVc2VyID0gbmV3UHJvZmlsZTtcbiAgICB9XG5cbiAgICBzYXZlVXNlclNlc3Npb24oY2FuZGlkYXRlVXNlcik7XG4gICAgXG4gICAgLy8gRmV0Y2ggdGhlaXIgYXBwc1xuICAgIGNvbnN0IHsgZGF0YTogYXBwc0RhdGEgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2FwcGxpY2F0aW9ucycpLnNlbGVjdCgnKicpLmVxKCd1c2VyRW1haWwnLCBub3JtYWxpemVkRW1haWwpO1xuICAgIGlmIChhcHBzRGF0YSkgc2V0QXBwbGljYXRpb25zKGFwcHNEYXRhKTtcbiAgICBcbiAgICBzZXRBY3RpdmVUYWIoJ2NhbmRpZGF0ZXMnKTtcbiAgICByZXR1cm4gY2FuZGlkYXRlVXNlcjtcbiAgfTtcblxuICBjb25zdCByZWdpc3RlckNhbmRpZGF0ZSA9IGFzeW5jIChkYXRhKSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEVtYWlsID0gKGRhdGEuZW1haWwgfHwgJycpLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIFxuICAgIGNvbnN0IGNhbmRpZGF0ZVVzZXIgPSB7XG4gICAgICBuYW1lOiBkYXRhLmZ1bGxOYW1lIHx8ICcnLFxuICAgICAgZW1haWw6IG5vcm1hbGl6ZWRFbWFpbCxcbiAgICAgIHBob25lOiBkYXRhLnBob25lIHx8ICcnLFxuICAgICAgdGl0bGU6IGRhdGEuaW5kdXN0cnkgfHwgJycsXG4gICAgICBwcmVmZXJyZWRDb3VudHJ5OiBkYXRhLnByZWZlcnJlZENvdW50cnkgfHwgJycsXG4gICAgICByZXN1bWVVcGxvYWRlZDogISFkYXRhLnJlc3VtZU5hbWUsXG4gICAgICByZXN1bWVOYW1lOiBkYXRhLnJlc3VtZU5hbWUgfHwgJycsXG4gICAgICByb2xlOiAnY2FuZGlkYXRlJyxcbiAgICAgIGNhbmRpZGF0ZUlkOiAnUmV2aXZhbCBJbnRlcm5hdGlvbmFsLUNBTi0nICsgTWF0aC5mbG9vcigxMDAwMCArIE1hdGgucmFuZG9tKCkgKiA5MDAwMCksXG4gICAgfTtcblxuICAgIC8vIFVwc2VydCBpbnRvIFN1cGFiYXNlXG4gICAgY29uc3QgeyBkYXRhOiBwcm9maWxlLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdwcm9maWxlcycpXG4gICAgICAudXBzZXJ0KFtjYW5kaWRhdGVVc2VyXSwgeyBvbkNvbmZsaWN0OiAnZW1haWwnIH0pXG4gICAgICAuc2VsZWN0KClcbiAgICAgIC5zaW5nbGUoKTtcblxuICAgIGNvbnN0IGZpbmFsVXNlciA9IHByb2ZpbGUgfHwgY2FuZGlkYXRlVXNlcjtcbiAgICBzYXZlVXNlclNlc3Npb24oZmluYWxVc2VyKTtcbiAgICBzZXRBY3RpdmVUYWIoJ2NhbmRpZGF0ZXMnKTtcbiAgICBcbiAgICBpZiAoY3JtICYmIGNybS5hZGRDYW5kaWRhdGUpIHtcbiAgICAgIGNybS5hZGRDYW5kaWRhdGUoe1xuICAgICAgICBuYW1lOiBmaW5hbFVzZXIubmFtZSxcbiAgICAgICAgZW1haWw6IGZpbmFsVXNlci5lbWFpbCxcbiAgICAgICAgcGhvbmU6IGZpbmFsVXNlci5waG9uZSxcbiAgICAgICAgdGl0bGU6IGZpbmFsVXNlci50aXRsZSxcbiAgICAgICAgc3RhdHVzOiAnV2ViIExlYWQnLFxuICAgICAgICBzY29yZTogODUsXG4gICAgICAgIHN0YWdlOiAnbGVhZCdcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBmaW5hbFVzZXI7XG4gIH07XG5cbiAgY29uc3QgdXBkYXRlVXNlclByb2ZpbGUgPSBhc3luYyAocHJvZmlsZURhdGEpID0+IHtcbiAgICBpZiAoIXVzZXIgfHwgIXVzZXIuZW1haWwpIHJldHVybjtcbiAgICBcbiAgICBjb25zdCB1cGRhdGVkID0geyAuLi51c2VyLCAuLi5wcm9maWxlRGF0YSB9O1xuICAgIHNldFVzZXIodXBkYXRlZCk7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3Npcl91c2VyX3Nlc3Npb24nLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkKSk7XG4gICAgXG4gICAgLy8gU3luYyB0byBTdXBhYmFzZVxuICAgIGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgncHJvZmlsZXMnKVxuICAgICAgLnVwZGF0ZShwcm9maWxlRGF0YSlcbiAgICAgIC5lcSgnZW1haWwnLCB1c2VyLmVtYWlsKTtcbiAgICAgIFxuICAgIHJldHVybiB1cGRhdGVkO1xuICB9O1xuXG4gIGNvbnN0IGxvZ2luRW1wbG95ZXIgPSBhc3luYyAoY29tcGFueUVtYWlsLCBhY2NvdW50SWQsIHBhc3N3b3JkKSA9PiB7XG4gICAgY29uc3Qgbm9ybWFsaXplZEVtYWlsID0gKGNvbXBhbnlFbWFpbCB8fCAnJykudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgXG4gICAgbGV0IHsgZGF0YTogZW1wbG95ZXJVc2VyLCBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2VcbiAgICAgIC5mcm9tKCdwcm9maWxlcycpXG4gICAgICAuc2VsZWN0KCcqJylcbiAgICAgIC5lcSgnZW1haWwnLCBub3JtYWxpemVkRW1haWwpXG4gICAgICAuZXEoJ3JvbGUnLCAnZW1wbG95ZXInKVxuICAgICAgLnNpbmdsZSgpO1xuXG4gICAgaWYgKCFlbXBsb3llclVzZXIpIHtcbiAgICAgIGVtcGxveWVyVXNlciA9IHtcbiAgICAgICAgbmFtZTogY29tcGFueUVtYWlsLnNwbGl0KCdAJylbMF0ucmVwbGFjZSgnLicsICcgJykucmVwbGFjZSgvXFxiXFx3L2csIGMgPT4gYy50b1VwcGVyQ2FzZSgpKSB8fCAnQ29ycG9yYXRlIEhSIERpcmVjdG9yJyxcbiAgICAgICAgY29tcGFueU5hbWU6ICdBbCBIYWJ0b29yIENvbnRyYWN0aW5nIExMQycsXG4gICAgICAgIGVtYWlsOiBub3JtYWxpemVkRW1haWwsXG4gICAgICAgIHJvbGU6ICdlbXBsb3llcicsXG4gICAgICAgIG1vaHJlQXR0ZXN0ZWQ6IHRydWVcbiAgICAgIH07XG4gICAgICBcbiAgICAgIGNvbnN0IHsgZGF0YTogbmV3RW1wIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdwcm9maWxlcycpLmluc2VydChbZW1wbG95ZXJVc2VyXSkuc2VsZWN0KCkuc2luZ2xlKCk7XG4gICAgICBpZiAobmV3RW1wKSBlbXBsb3llclVzZXIgPSBuZXdFbXA7XG4gICAgfVxuXG4gICAgc2F2ZVVzZXJTZXNzaW9uKGVtcGxveWVyVXNlcik7XG4gICAgc2V0QWN0aXZlVGFiKCdlbXBsb3llcnMnKTtcbiAgICByZXR1cm4gZW1wbG95ZXJVc2VyO1xuICB9O1xuXG4gIGNvbnN0IGxvZ291dCA9ICgpID0+IHtcbiAgICBzYXZlVXNlclNlc3Npb24obnVsbCk7XG4gICAgc2V0QWN0aXZlVGFiKCdob21lJyk7XG4gICAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgJycsICcvJyk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHRvZ2dsZURhcmtNb2RlID0gKCkgPT4ge1xuICAgIHNldERhcmtNb2RlKHByZXYgPT4ge1xuICAgICAgY29uc3QgbmV4dCA9ICFwcmV2O1xuICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2RhcmsnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdkYXJrJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dDtcbiAgICB9KTtcbiAgfTtcblxuICBjb25zdCB0b2dnbGVTYXZlSm9iID0gKGpvYklkKSA9PiB7XG4gICAgc2V0U2F2ZWRKb2JzKHByZXYgPT4gXG4gICAgICBwcmV2LmluY2x1ZGVzKGpvYklkKSA/IHByZXYuZmlsdGVyKGlkID0+IGlkICE9PSBqb2JJZCkgOiBbLi4ucHJldiwgam9iSWRdXG4gICAgKTtcbiAgfTtcblxuICBjb25zdCBhcHBseUZvckpvYiA9IGFzeW5jIChqb2IpID0+IHtcbiAgICBpZiAoIWpvYiB8fCAham9iLmlkIHx8ICF1c2VyIHx8ICF1c2VyLmVtYWlsKSByZXR1cm47XG4gICAgXG4gICAgY29uc3QgbmV3QXBwID0ge1xuICAgICAgam9iSWQ6IGpvYi5pZCxcbiAgICAgIHVzZXJFbWFpbDogdXNlci5lbWFpbCxcbiAgICAgIGpvYlRpdGxlOiBqb2IudGl0bGUsXG4gICAgICBjb21wYW55OiBqb2IuY29tcGFueSxcbiAgICAgIGNvdW50cnk6IGpvYi5jb3VudHJ5LFxuICAgICAgYXBwbGllZERhdGU6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5zcGxpdCgnVCcpWzBdLFxuICAgICAgc3RhdHVzOiAnVW5kZXIgQUkgUmVzdW1lIFNjcmVlbmluZycsXG4gICAgICBzdGVwOiAxXG4gICAgfTtcbiAgICBcbiAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5mcm9tKCdhcHBsaWNhdGlvbnMnKS5pbnNlcnQoW25ld0FwcF0pLnNlbGVjdCgpLnNpbmdsZSgpO1xuICAgIGlmICghZXJyb3IgJiYgZGF0YSkge1xuICAgICAgc2V0QXBwbGljYXRpb25zKHByZXYgPT4gW2RhdGEsIC4uLnByZXZdKTtcbiAgICB9XG4gIH07XG5cbiAgY29uc3QgdXBkYXRlQXBwbGljYXRpb25TdGF0dXMgPSBhc3luYyAoYXBwSWQsIG5ld1N0YXR1cywgc3RlcCkgPT4ge1xuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlXG4gICAgICAuZnJvbSgnYXBwbGljYXRpb25zJylcbiAgICAgIC51cGRhdGUoeyBzdGF0dXM6IG5ld1N0YXR1cywgc3RlcDogc3RlcCB9KVxuICAgICAgLmVxKCdpZCcsIGFwcElkKVxuICAgICAgLnNlbGVjdCgpXG4gICAgICAuc2luZ2xlKCk7XG5cbiAgICBpZiAoIWVycm9yICYmIGRhdGEpIHtcbiAgICAgIHNldEFwcGxpY2F0aW9ucyhwcmV2ID0+IHByZXYubWFwKGFwcCA9PiAoYXBwLmlkID09PSBhcHBJZCA/IGRhdGEgOiBhcHApKSk7XG4gICAgfVxuICB9O1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgaGFuZGxlVXJsU3luYyA9ICgpID0+IHtcbiAgICAgIGNvbnN0IHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUucmVwbGFjZSgvXlxcLyt8LyskL2csICcnKTtcbiAgICAgIGNvbnN0IGhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywgJycpO1xuICAgICAgaWYgKHBhdGggPT09ICdjcm0nIHx8IHBhdGguc3RhcnRzV2l0aCgnY3JtLycpIHx8IGhhc2ggPT09ICdjcm0nKSB7XG4gICAgICAgIHNldEFjdGl2ZVRhYignY3JtJyk7XG4gICAgICB9IGVsc2UgaWYgKGhhc2gpIHtcbiAgICAgICAgc2V0QWN0aXZlVGFiKGhhc2gpO1xuICAgICAgfSBlbHNlIGlmIChwYXRoICYmIHBhdGggIT09ICcnKSB7XG4gICAgICAgIHNldEFjdGl2ZVRhYihwYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNldEFjdGl2ZVRhYignaG9tZScpO1xuICAgICAgfVxuICAgIH07XG4gICAgaGFuZGxlVXJsU3luYygpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgaGFuZGxlVXJsU3luYyk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgaGFuZGxlVXJsU3luYyk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgaGFuZGxlVXJsU3luYyk7XG4gICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBoYW5kbGVVcmxTeW5jKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgY29uc3QgYWRkSm9iID0gYXN5bmMgKGpvYkRhdGEpID0+IHtcbiAgICBjb25zdCBuZXdKb2IgPSB7XG4gICAgICB0aXRsZTogam9iRGF0YS50aXRsZSB8fCAnVW50aXRsZWQgUm9sZScsXG4gICAgICBjb21wYW55OiB1c2VyPy5jb21wYW55TmFtZSB8fCBqb2JEYXRhLmNvbXBhbnkgfHwgJ0FsIEhhYnRvb3IgQ29udHJhY3RpbmcgTExDJyxcbiAgICAgIGNvdW50cnk6IGpvYkRhdGEuY291bnRyeSB8fCAnVUFFJyxcbiAgICAgIGxvY2F0aW9uOiBqb2JEYXRhLmxvY2F0aW9uIHx8IGAke2pvYkRhdGEuY291bnRyeSB8fCAnVUFFJ30sIEJ1c2luZXNzIERpc3RyaWN0YCxcbiAgICAgIHNhbGFyeTogam9iRGF0YS5zYWxhcnkgfHwgJ05lZ290aWFibGUnLFxuICAgICAgZXhwZXJpZW5jZTogam9iRGF0YS5leHBlcmllbmNlIHx8ICcyIC0gNSBZZWFycycsXG4gICAgICBqb2JUeXBlOiBqb2JEYXRhLmpvYlR5cGUgfHwgJ0Z1bGwtdGltZScsXG4gICAgICBjYXRlZ29yeTogam9iRGF0YS5jYXRlZ29yeSB8fCAnQ29uc3RydWN0aW9uJyxcbiAgICAgIGRlc2NyaXB0aW9uOiBqb2JEYXRhLmRlc2NyaXB0aW9uIHx8ICdKb2IgbWFuZGF0ZSBwb3N0ZWQgdmlhIFJldml2YWwgSW50ZXJuYXRpb25hbCBFbXBsb3llciBQb3J0YWwuJyxcbiAgICAgIHZhY2FuY2llczogam9iRGF0YS52YWNhbmNpZXMgfHwgJzUnLFxuICAgICAgc2tpbGxzOiBBcnJheS5pc0FycmF5KGpvYkRhdGEuc2tpbGxzKVxuICAgICAgICA/IGpvYkRhdGEuc2tpbGxzXG4gICAgICAgIDogKGpvYkRhdGEuc2tpbGxzID8gam9iRGF0YS5za2lsbHMuc3BsaXQoJywnKS5tYXAocyA9PiBzLnRyaW0oKSkgOiBbJ01hbmFnZW1lbnQnLCAnT3BlcmF0aW9ucyddKSxcbiAgICAgIHF1YWxpZmljYXRpb246IGpvYkRhdGEucXVhbGlmaWNhdGlvbiB8fCBcIkJhY2hlbG9yJ3MgRGVncmVlXCIsXG4gICAgICBiZW5lZml0czogQXJyYXkuaXNBcnJheShqb2JEYXRhLmJlbmVmaXRzKVxuICAgICAgICA/IGpvYkRhdGEuYmVuZWZpdHNcbiAgICAgICAgOiAoam9iRGF0YS5iZW5lZml0cyA/IGpvYkRhdGEuYmVuZWZpdHMuc3BsaXQoJywnKS5tYXAoYiA9PiBiLnRyaW0oKSkgOiBbJ1RheC1mcmVlIHNhbGFyeScsICdWaXNhIFNwb25zb3JzaGlwJywgJ01lZGljYWwgSW5zdXJhbmNlJ10pLFxuICAgICAgcG9zdGVkRGF0ZTogJ0p1c3Qgbm93JyxcbiAgICAgIGZlYXR1cmVkOiB0cnVlXG4gICAgfTtcblxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlLmZyb20oJ2pvYnMnKS5pbnNlcnQoW25ld0pvYl0pLnNlbGVjdCgpLnNpbmdsZSgpO1xuICAgIGlmICghZXJyb3IgJiYgZGF0YSkge1xuICAgICAgc2V0UG9zdGVkSm9icyhwcmV2ID0+IFtkYXRhLCAuLi5wcmV2XSk7XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xuICB9O1xuXG4gIGNvbnN0IGRlbGV0ZUpvYiA9IGFzeW5jIChqb2JJZCkgPT4ge1xuICAgIGF3YWl0IHN1cGFiYXNlLmZyb20oJ2pvYnMnKS5kZWxldGUoKS5lcSgnaWQnLCBqb2JJZCk7XG4gICAgc2V0UG9zdGVkSm9icyhwcmV2ID0+IHByZXYuZmlsdGVyKGogPT4gai5pZCAhPT0gam9iSWQpKTtcbiAgfTtcblxuICBjb25zdCBbc2VsZWN0ZWRTZXJ2aWNlSWQsIHNldFNlbGVjdGVkU2VydmljZUlkXSA9IHVzZVN0YXRlKG51bGwpO1xuICBjb25zdCBbc2VsZWN0ZWRJbmR1c3RyeUlkLCBzZXRTZWxlY3RlZEluZHVzdHJ5SWRdID0gdXNlU3RhdGUobnVsbCk7XG5cbiAgY29uc3QgbmF2aWdhdGVUbyA9ICh0YWIpID0+IHtcbiAgICBzZXRBY3RpdmVUYWIodGFiKTtcbiAgICBpZiAodGFiID09PSAnY3JtJykge1xuICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgJy9jcm0nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zdGFydHNXaXRoKCcvY3JtJykpIHtcbiAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKHt9LCAnJywgJy8nICsgKHRhYiA9PT0gJ2hvbWUnID8gJycgOiBgIyR7dGFifWApKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gdGFiO1xuICAgICAgfVxuICAgIH1cbiAgICB3aW5kb3cuc2Nyb2xsVG8oeyB0b3A6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgfTtcblxuICBjb25zdCBuYXZpZ2F0ZVRvU2VydmljZSA9IChzZXJ2aWNlSWQpID0+IHtcbiAgICBzZXRTZWxlY3RlZFNlcnZpY2VJZChzZXJ2aWNlSWQpO1xuICAgIHNldEFjdGl2ZVRhYignc2VydmljZXMnKTtcbiAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9ICdzZXJ2aWNlcyc7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjb25zdCBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYHNlcnZpY2UtJHtzZXJ2aWNlSWR9YCk7XG4gICAgICBpZiAoZWxlbSkge1xuICAgICAgICBlbGVtLnNjcm9sbEludG9WaWV3KHsgYmVoYXZpb3I6ICdzbW9vdGgnLCBibG9jazogJ2NlbnRlcicgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oeyB0b3A6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgICAgIH1cbiAgICB9LCAxMjApO1xuICB9O1xuXG4gIGNvbnN0IG5hdmlnYXRlVG9JbmR1c3RyeSA9IChpbmR1c3RyeUlkKSA9PiB7XG4gICAgc2V0U2VsZWN0ZWRJbmR1c3RyeUlkKGluZHVzdHJ5SWQpO1xuICAgIHNldEFjdGl2ZVRhYignaW5kdXN0cmllcycpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gJ2luZHVzdHJpZXMnO1xuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgY29uc3QgZWxlbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGBpbmR1c3RyeS0ke2luZHVzdHJ5SWR9YCk7XG4gICAgICBpZiAoZWxlbSkge1xuICAgICAgICBlbGVtLnNjcm9sbEludG9WaWV3KHsgYmVoYXZpb3I6ICdzbW9vdGgnLCBibG9jazogJ2NlbnRlcicgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oeyB0b3A6IDAsIGJlaGF2aW9yOiAnc21vb3RoJyB9KTtcbiAgICAgIH1cbiAgICB9LCAxMjApO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPEFwcENvbnRleHQuUHJvdmlkZXJcbiAgICAgIHZhbHVlPXt7XG4gICAgICAgIGRhcmtNb2RlLCB0b2dnbGVEYXJrTW9kZSwgbGFuZ3VhZ2UsIHNldExhbmd1YWdlLCB0LCBjdXJyZW5jeSwgc2V0Q3VycmVuY3ksXG4gICAgICAgIGFjdGl2ZVRhYiwgbmF2aWdhdGVUbywgc2VsZWN0ZWRTZXJ2aWNlSWQsIHNldFNlbGVjdGVkU2VydmljZUlkLFxuICAgICAgICBzZWxlY3RlZEluZHVzdHJ5SWQsIHNldFNlbGVjdGVkSW5kdXN0cnlJZCwgbmF2aWdhdGVUb1NlcnZpY2UsIG5hdmlnYXRlVG9JbmR1c3RyeSxcbiAgICAgICAgc2VsZWN0ZWRKb2IsIHNldFNlbGVjdGVkSm9iLCBzZWxlY3RlZEpvYkNhdGVnb3J5LCBzZXRTZWxlY3RlZEpvYkNhdGVnb3J5LFxuICAgICAgICBhY3RpdmVNb2RhbCwgc2V0QWN0aXZlTW9kYWwsIGF1dGhNb2RhbENvbmZpZywgb3BlbkF1dGhNb2RhbCxcbiAgICAgICAgc2F2ZWRKb2JzLCB0b2dnbGVTYXZlSm9iLCBhcHBsaWNhdGlvbnMsIGFwcGx5Rm9ySm9iLCB1cGRhdGVBcHBsaWNhdGlvblN0YXR1cyxcbiAgICAgICAgcG9zdGVkSm9icywgYWRkSm9iLCBkZWxldGVKb2IsIHVzZXIsIHNldFVzZXIsIHVwZGF0ZVVzZXJQcm9maWxlLFxuICAgICAgICBsb2dpbkNhbmRpZGF0ZSwgcmVnaXN0ZXJDYW5kaWRhdGUsIGxvZ2luRW1wbG95ZXIsIGxvZ291dCwgbG9hZGluZ0luaXRpYWxEYXRhXG4gICAgICB9fVxuICAgID5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L0FwcENvbnRleHQuUHJvdmlkZXI+XG4gICk7XG59O1xuXG5leHBvcnQgY29uc3QgdXNlQXBwID0gKCkgPT4gdXNlQ29udGV4dChBcHBDb250ZXh0KTtcbiJdLCJmaWxlIjoiQzovVXNlcnMvQWRtaW4vRG93bmxvYWRzL1NJUi1tYWluL1NJUi1tYWluL3NyYy9jb250ZXh0L0FwcENvbnRleHQuanN4In0=

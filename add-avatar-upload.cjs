const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'CandidatePortal.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Inject state
content = content.replace(
  /const CandidatePortal = \(\) => {/,
  `const CandidatePortal = () => {
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const handleAvatarUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };`
);

// Inject label and input around the avatar
const oldAvatarJSX = `<div className="w-24 h-24 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-[#111] relative">
                          {user.avatar ? (
                            <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover p-1" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                          )}
                          <button type="button" className="absolute bottom-0 right-0 bg-[#d4af37] text-white p-2.5 rounded-full border-2 border-white dark:border-[#111] shadow-lg hover:scale-110 transition transform">
                            <Camera className="w-4 h-4" />
                          </button>
                        </div>`;

const newAvatarJSX = `<label className="w-24 h-24 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center bg-slate-50 dark:bg-[#111] relative cursor-pointer group">
                          <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                          {avatarPreview || user.avatar ? (
                            <img src={avatarPreview || user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover p-1" />
                          ) : (
                            <User className="w-8 h-8 text-slate-400 dark:text-slate-500 group-hover:text-gold-500 transition-colors" />
                          )}
                          <div className="absolute bottom-0 right-0 bg-[#d4af37] text-white p-2.5 rounded-full border-2 border-white dark:border-[#111] shadow-lg hover:scale-110 transition transform">
                            <Camera className="w-4 h-4" />
                          </div>
                        </label>`;

if (content.includes(oldAvatarJSX)) {
  content = content.replace(oldAvatarJSX, newAvatarJSX);
  fs.writeFileSync(filePath, content);
  console.log("Successfully implemented functional avatar upload!");
} else {
  console.log("Could not find the exact avatar JSX block. It might have changed.");
}

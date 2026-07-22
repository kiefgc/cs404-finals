"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ProfileData {
  id: number;
  name: string;
  handle: string;
  bio: string | null;
  location: string | null;
  profile_pic: string | null;
}

interface ProfileEditClientProps {
  initialData: ProfileData;
}

export default function ProfileEditClient({ initialData }: ProfileEditClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: initialData.name,
    handle: initialData.handle,
    bio: initialData.bio || "",
    location: initialData.location || "",
    profile_pic: initialData.profile_pic || "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({});
  const [generalError, setGeneralError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        if (value.length > 100) return "Name must be 100 characters or less";
        return "";
      case "handle":
        if (!value.trim()) return "Handle is required";
        if (value.length > 50) return "Handle must be 50 characters or less";
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return "Handle can only contain letters, numbers, underscores, and hyphens";
        }
        return "";
      case "bio":
        if (value.length > 500) return "Bio must be 500 characters or less";
        return "";
      case "location":
        if (value.length > 100) return "Location must be 100 characters or less";
        return "";
      case "profile_pic":
        if (value && value.trim() !== "") {
          try {
            new URL(value);
          } catch {
            return "Profile picture must be a valid URL";
          }
        }
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError("");
    setSuccess("");

    // Validate all fields
    const newErrors: Partial<Record<keyof typeof formData, string>> = {};
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const fieldErrors: Partial<Record<keyof typeof formData, string>> = {};
          data.errors.forEach((err: { path: string; message: string }) => {
            fieldErrors[err.path as keyof typeof formData] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          setGeneralError(data.error || "Failed to update profile");
        }
        return;
      }

      setSuccess("Profile updated successfully!");
      setTimeout(() => {
        router.push(`/profile/${initialData.id}`);
        router.refresh();
      }, 1500);
    } catch {
      setGeneralError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/profile/${initialData.id}`);
  };

  // Helper to get initials for fallback avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "PV";
  };

  return (
    <div className="flex items-center justify-center min-h-[75vh] py-8">
      <div className="flex flex-col md:flex-row w-full max-w-5xl bg-brand-surface border border-white/5 rounded overflow-hidden shadow-2xl">
        {/* Left side - branding */}
        <div className="relative w-full md:w-1/2 min-h-[400px] md:min-h-[600px] bg-brand-tertiary flex items-end p-10 md:p-14">
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/95 via-brand-bg/40 to-transparent z-10" />
          <div className="relative z-20 max-w-sm">
            <h1 className="font-headline text-4xl md:text-5xl text-white font-bold leading-tight mb-4">
              Edit Your<br />Profile
            </h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Update your personal information and customize your presence in the community.
            </p>
          </div>
        </div>

        {/* Right side - form */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col justify-center">
          <div className="w-full">
            <h2 className="font-headline text-4xl text-white mb-2">Edit Profile</h2>
            <p className="text-sm text-gray-400 mb-10">Make changes to your account details.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Picture Preview */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative mb-4">
                  {formData.profile_pic && formData.profile_pic.trim() !== "" ? (
                    <img
                      src={formData.profile_pic}
                      alt="Profile preview"
                      width={100}
                      height={100}
                      className="rounded-full object-cover border-2 border-brand-primary-button"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-brand-tertiary border border-white/10 text-4xl font-bold text-brand-primary-button">
                      {getInitials(formData.name)}
                    </div>
                  )}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Name
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your name"
                  required
                  className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400"
                />
                {errors.name && (
                  <p className="mt-1 text-red-400 text-xs font-semibold">{errors.name}</p>
                )}
              </div>

              {/* Handle */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <input
                    name="handle"
                    type="text"
                    value={formData.handle}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="username"
                    required
                    className="w-full bg-white text-black pl-10 pr-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400"
                  />
                </div>
                {errors.handle && (
                  <p className="mt-1 text-red-400 text-xs font-semibold">{errors.handle}</p>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows={3}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400 resize-none"
                />
                {errors.bio && (
                  <p className="mt-1 text-red-400 text-xs font-semibold">{errors.bio}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Location
                </label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your location"
                  className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400"
                />
                {errors.location && (
                  <p className="mt-1 text-red-400 text-xs font-semibold">{errors.location}</p>
                )}
              </div>

              {/* Profile Picture URL */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Profile Picture URL
                </label>
                <input
                  name="profile_pic"
                  type="url"
                  value={formData.profile_pic}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="https://example.com/avatar.png"
                  className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition placeholder:text-gray-400"
                />
                {errors.profile_pic && (
                  <p className="mt-1 text-red-400 text-xs font-semibold">{errors.profile_pic}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Enter a direct image URL (https://...)</p>
              </div>

              {generalError && (
                <p className="text-red-400 text-xs font-semibold">{generalError}</p>
              )}

              {success && (
                <p className="text-brand-primary-light text-xs font-semibold">{success}</p>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold uppercase tracking-widest py-3.5 rounded-sm transition text-xs disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-transparent border border-white/10 hover:border-white/30 text-white font-bold py-3.5 rounded-sm transition text-xs disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>

            <p className="mt-8 text-center text-xs text-gray-500">
              <Link href={`/profile/${initialData.id}`} className="text-brand-primary-light font-bold hover:text-white transition">
                ← Back to Profile
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
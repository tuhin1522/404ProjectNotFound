import Swal from "sweetalert2";
import { toast } from "sonner";

const getBaseSwalConfig = () => {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    background: isDark ? "#111111" : "#ffffff",
    color: isDark ? "#f8fafc" : "#0f172a",
    backdrop: isDark ? "rgba(0, 0, 0, 0.72)" : "rgba(255, 255, 255, 0.72)",
    showClass: {
      popup: "",
      backdrop: "",
      icon: "",
    },
    hideClass: {
      popup: "",
      backdrop: "",
      icon: "",
    },
    customClass: {
      popup: `!rounded-2xl !border ${isDark ? '!border-[#2a2a2a]' : '!border-gray-200'} !shadow-2xl`,
      title: `!text-xl !font-semibold ${isDark ? '!text-white' : '!text-gray-900'}`,
      htmlContainer: `!text-sm ${isDark ? '!text-[#cbd5e1]' : '!text-gray-600'}`,
      confirmButton:
        "!rounded-lg !bg-indigo-600 !px-4 !py-2 !text-sm !font-medium !text-white !shadow-none",
      cancelButton:
        `!rounded-lg !border ${isDark ? '!border-[#333] !bg-[#1e1e1e] !text-[#e5e7eb]' : '!border-gray-300 !bg-gray-100 !text-gray-700'} !px-4 !py-2 !text-sm !font-medium !shadow-none`,
    },
  };
};

export const swalConfirm = async ({
  title = "Confirm action",
  text = "Please review this action before continuing.",
  confirmButtonText = "Continue",
  cancelButtonText = "Keep it",
}: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
} = {}) => {
  const result = await Swal.fire({
    ...getBaseSwalConfig(),
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    reverseButtons: true,
    focusCancel: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#4f46e5",
    cancelButtonColor: "#1f2937",
  });

  return result.isConfirmed;
};

export const swalSuccess = async ({
  title = "Done",
  text = "Your changes were saved successfully.",
  timer = 1500,
}: {
  title?: string;
  text?: string;
  timer?: number;
} = {}) => {
  toast.success(title, {
    description: text,
    duration: timer,
  });
};

export const swalError = async ({
  title = "Something went wrong",
  text = "Please try again in a moment.",
}: {
  title?: string;
  text?: string;
} = {}) => {
  await Swal.fire({
    ...getBaseSwalConfig(),
    icon: "error",
    title,
    text,
    confirmButtonColor: "#ef4444",
  });
};

export const swalLoading = async ({
  title = "Please wait...",
}: {
  title?: string;
} = {}) => {
  await Swal.fire({
    ...getBaseSwalConfig(),
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    showConfirmButton: false,
  });
};

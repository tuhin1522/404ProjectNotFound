import Swal from "sweetalert2";

export const swalConfirm = async ({
  title = "Are you sure?",
  text = "This action cannot be undone.",
  confirmButtonText = "Yes, continue",
  cancelButtonText = "Cancel",
}: {
  title?: string;
  text?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
} = {}) => {
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    confirmButtonColor: "#22C55E",
    cancelButtonColor: "#27272A",
  });

  return result.isConfirmed;
};

export const swalSuccess = async ({
  title = "Success",
  text,
  timer = 1800,
}: {
  title?: string;
  text?: string;
  timer?: number;
} = {}) => {
  await Swal.fire({
    icon: "success",
    title,
    text,
    timer,
    showConfirmButton: false,
    toast: false,
  });
};

export const swalError = async ({
  title = "Error",
  text,
}: {
  title?: string;
  text?: string;
} = {}) => {
  await Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#EF4444",
  });
};

export const swalLoading = async ({
  title = "Please wait...",
}: {
  title?: string;
} = {}) => {
  await Swal.fire({
    title,
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    },
    showConfirmButton: false,
  });
};

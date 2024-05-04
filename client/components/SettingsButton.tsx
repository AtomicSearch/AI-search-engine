import { SettingsForm } from "./SettingsForm";
import { toast } from "react-hot-toast";

export function SettingsButton() {
  return (
    <button
      style={{ fontSize: "small" }}
      onClick={() =>
        toast(
          <div>
            <SettingsForm />
            <div
              style={{
                display: "flex",
                justifyContent: "left",
                marginTop: "8px",
              }}
            >
              <button
                style={{ fontSize: "small" }}
                onClick={() => toast.dismiss()}
              >
                ✅
              </button>
            </div>
          </div>,
          {
            id: "settings-toast",
            duration: Infinity,
            position: "bottom-left",
            style: {
              borderRadius: "10px",
              background: "var(--background)",
              color: "var(--text-main)",
            },
          },
        )
      }
    >
      Options
    </button>
  );
}

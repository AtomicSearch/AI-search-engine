import { toast } from "react-hot-toast";
import styled from "styled-components";

import { SettingsForm } from "./SettingsForm";
import { Button } from "./atoms/Button";

const SettingButtonWrapper = styled.div`
  display: flex;
  justify-content: left;
  position: fixed;
  bottom: 0.2rem;
  left: 0.6rem;
  right: 0;
`;

export const SettingButton = () => {
  return (
    <SettingButtonWrapper>
      <Button
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
                <Button
                  style={{ fontSize: "small" }}
                  onClick={() => toast.dismiss()}
                >
                  ✅
                </Button>
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
      </Button>
    </SettingButtonWrapper>
  );
};

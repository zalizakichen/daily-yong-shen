import { useEffect, useRef, useState } from "react";
import SwipeDeleteRow from "./SwipeDeleteRow";

type OpenMenu = "profile" | "user" | null;

type Props = {
  userName: string;
  otherUserNames: string[];
  showResumeOnboarding?: boolean;
  onResumeOnboarding?: () => void;
  profileOnly?: boolean;
  onSelectUser: (name: string) => void;
  onDeleteUser: (name: string) => void;
  onNewUser: () => void;
  onOpenProfileBazi: () => void;
  onOpenProfileSchedule: () => void;
  onOpenProfileCalendar: () => void;
};

export default function WelcomeBackActions({
  userName,
  otherUserNames,
  showResumeOnboarding = false,
  onResumeOnboarding,
  profileOnly = false,
  onSelectUser,
  onDeleteUser,
  onNewUser,
  onOpenProfileBazi,
  onOpenProfileSchedule,
  onOpenProfileCalendar,
}: Props) {
  const [openMenu, setOpenMenu] = useState<OpenMenu>(null);
  const [openSwipeRowId, setOpenSwipeRowId] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const actionsScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openMenu) {
      setOpenSwipeRowId(null);
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (profileMenuRef.current?.contains(target)) return;
      if (userMenuRef.current?.contains(target)) return;
      setOpenMenu(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenu]);

  useEffect(() => {
    if (!openMenu) return;
    const menuRef = openMenu === "profile" ? profileMenuRef : userMenuRef;
    const scrollTimer = window.setTimeout(() => {
      menuRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }, 0);
    return () => window.clearTimeout(scrollTimer);
  }, [openMenu]);

  const toggleMenu = (menu: Exclude<OpenMenu, null>) => {
    setOpenMenu((current) => (current === menu ? null : menu));
  };

  return (
    <div className="welcome-back-actions-scroll" ref={actionsScrollRef}>
      <div className="welcome-back-actions">
        {!profileOnly && showResumeOnboarding && onResumeOnboarding && (
          <button
            type="button"
            className="action-btn action-btn--review action-btn--welcome-back action-btn--welcome-back-resume"
            onClick={onResumeOnboarding}
          >
            继续上次操作
          </button>
        )}

        <div className="welcome-back-switch" ref={profileMenuRef}>
          <button
            type="button"
            className={`action-btn action-btn--review action-btn--welcome-back action-btn--welcome-back-profile${openMenu === "profile" ? " is-active" : ""}`}
            onClick={() => toggleMenu("profile")}
            aria-expanded={openMenu === "profile"}
          >
            我的档案
          </button>

          {openMenu === "profile" && (
            <div className="welcome-back-menu" role="menu">
              <button
                type="button"
                className="welcome-back-menu-item"
                role="menuitem"
                onClick={() => {
                  onOpenProfileBazi();
                  setOpenMenu(null);
                }}
              >
                我的八字
              </button>
              <button
                type="button"
                className="welcome-back-menu-item"
                role="menuitem"
                onClick={() => {
                  onOpenProfileSchedule();
                  setOpenMenu(null);
                }}
              >
                我的预约
              </button>
              <button
                type="button"
                className="welcome-back-menu-item"
                role="menuitem"
                onClick={() => {
                  onOpenProfileCalendar();
                  setOpenMenu(null);
                }}
              >
                我的用神日历
              </button>
            </div>
          )}
        </div>

        {!profileOnly && (
        <div className="welcome-back-switch" ref={userMenuRef}>
          <button
            type="button"
            className={`action-btn action-btn--review action-btn--welcome-back action-btn--welcome-back-user${openMenu === "user" ? " is-active" : ""}`}
            onClick={() => toggleMenu("user")}
            aria-expanded={openMenu === "user"}
          >
            {userName ? `我不是${userName}` : "更换称呼"}
          </button>

          {openMenu === "user" && (
            <div className="welcome-back-menu" role="menu">
              {otherUserNames.map((name) => (
                <SwipeDeleteRow
                  key={name}
                  rowId={name}
                  openRowId={openSwipeRowId}
                  onOpenChange={setOpenSwipeRowId}
                  onSelect={() => {
                    onSelectUser(name);
                    setOpenMenu(null);
                  }}
                  onDelete={() => onDeleteUser(name)}
                >
                  我是{name}
                </SwipeDeleteRow>
              ))}
              <button
                type="button"
                className="welcome-back-menu-item welcome-back-menu-item--new"
                role="menuitem"
                onClick={() => {
                  onNewUser();
                  setOpenMenu(null);
                }}
              >
                我是新用户
              </button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

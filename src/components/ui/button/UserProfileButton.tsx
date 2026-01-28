import { signOut } from "@/actions/auth";
import useBreakpoints from "@/hooks/useBreakpoints";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { DropdownItemProps } from "@/types/component";
import { env } from "@/utils/env";
import { Gear, Logout, User } from "@/utils/icons";
import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Spinner,
  User as HeroUIUser,
  addToast,
} from "@heroui/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const UserProfileButton: React.FC = () => {
  const router = useRouter();
  const [logout, setLogout] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useFirebaseAuth();
  const { mobile } = useBreakpoints();

  // Prevent hydration mismatch by only rendering after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = useCallback(async () => {
    if (logout) return;
    setLogout(true);
    const { success, message } = await signOut();
    addToast({
      title: message,
      color: success ? "primary" : "danger",
    });
    if (!success) {
      return setLogout(false);
    }
    return router.push("/auth");
  }, [logout, router]);

  const ITEMS: DropdownItemProps[] = useMemo(
    () => [
      // TODO: Add profile and settings page
      // { label: "Profile", href: "/profile", icon: <User /> },
      // { label: "Settings", href: "/settings", icon: <Gear /> },
      {
        label: "Logout",
        onClick: handleLogout,
        icon: logout ? <Spinner size="sm" color="danger" /> : <Logout />,
        color: "danger",
        className: "text-danger",
      },
    ],
    [handleLogout, logout],
  );

  // Don't render anything until after hydration to prevent mismatch
  if (!mounted || loading) return null;

  const guest = !user;
  // Use Gravatar as fallback if avatar provider URL is not configured
  const avatarProviderUrl = env.NEXT_PUBLIC_AVATAR_PROVIDER_URL || "https://www.gravatar.com/avatar/";
  const avatar = user?.email ? `${avatarProviderUrl}${user.email}?d=mp&s=40` : undefined;

  const ProfileButton = (
    <Button
      title={guest ? "Login" : (user.displayName || user.email || undefined)}
      variant="light"
      href={guest ? "/auth" : undefined}
      as={guest ? Link : undefined}
      isIconOnly={guest || mobile}
      endContent={
        !guest ? (
          <Avatar
            showFallback
            src={avatar}
            className="size-7"
            fallback={<User className="text-xl" />}
          />
        ) : undefined
      }
      className="min-w-fit"
    >
      {guest ? (
        <User className="text-xl" />
      ) : (
        <p className="hidden max-w-32 truncate md:block lg:max-w-56">{user.displayName || user.email}</p>
      )}
    </Button>
  );

  if (guest) return ProfileButton;

  return (
    <Dropdown showArrow closeOnSelect={false} className="w-10">
      <DropdownTrigger className="w-10">{ProfileButton}</DropdownTrigger>
      <DropdownMenu
        aria-label="User profile dropdown"
        variant="flat"
        disabledKeys={logout ? ITEMS.map((i) => i.label) : undefined}
      >
        {ITEMS.map(({ label, icon, ...props }) => (
          <DropdownItem key={label} startContent={icon} {...props}>
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
};

export default UserProfileButton;

"use client";

import { Divider } from "@astryxdesign/core/Divider";
import { HStack } from "@astryxdesign/core/HStack";
import { Icon } from "@astryxdesign/core/Icon";
import { IconButton } from "@astryxdesign/core/IconButton";
import { MobileNav } from "@astryxdesign/core/MobileNav";
import { Text } from "@astryxdesign/core/Text";
import { VStack } from "@astryxdesign/core/VStack";
import { useState } from "react";
import { accountRoute, inquiryRoute } from "@/design-system/routes";
import { ThemeToggle } from "@/components/theme";
import { ActionLink } from "./ActionLink";
import { PrimaryNavigationItems } from "./PrimaryNavigationItems";
import styles from "./Navigation.module.css";

const drawerId = "mobile-navigation";

export function MobileNavigation() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return <span className={styles.mobileRoot}>
    <IconButton
      label="بازکردن فهرست"
      variant="secondary"
      aria-expanded={open}
      aria-controls={drawerId}
      aria-haspopup="dialog"
      icon={<Icon icon="menu" color="inherit" />}
      onClick={() => setOpen(true)}
    />
    <MobileNav id={drawerId} isOpen={open} onOpenChange={setOpen} header="فهرست اصلی" side="end" aria-label="فهرست اصلی">
      <VStack gap={4}>
        <nav aria-label="ناوبری موبایل">
          <PrimaryNavigationItems placement="drawer" onNavigate={close} />
        </nav>
        <Divider />
        <HStack gap={3} vAlign="center" hAlign="between">
          <Text color="secondary">پوسته نمایش</Text>
          <ThemeToggle />
        </HStack>
        <VStack gap={2} onClick={close}>
          <ActionLink href={inquiryRoute.path} emphasis="primary">{inquiryRoute.label}</ActionLink>
          <ActionLink href={accountRoute.path}>{accountRoute.label}</ActionLink>
        </VStack>
      </VStack>
    </MobileNav>
  </span>;
}

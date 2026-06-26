### Comprehensive Pricing Details

The application utilizes **Clerk Billing** for organization-based subscriptions. The plans are structured to scale based on organization needs, from basic form management to enterprise-grade integrations.

#### 1. FREE Plan
*   **Price:** $0/month
*   **Form Capacity:** Limited to **3 forms** total per organization.
*   **Advanced Features:**
    *   Webhooks: **No**
    *   Conditional Logic: **No**
    *   SSO (Single Sign-On): **No**
*   **Best For:** Individuals or small teams validating ideas or managing simple data collection.

#### 2. STARTER Plan
*   **Price:** (Varies by Clerk configuration, typically ~$20/mo)
*   **Form Capacity:** **Unlimited** forms.
*   **Advanced Features:**
    *   Webhooks: **Yes** (Enabled for external integrations)
    *   Conditional Logic: **No**
    *   SSO (Single Sign-On): **No**
*   **Best For:** Growing teams that need to automate workflows via webhooks but don't require complex form logic.

#### 3. PROFESSIONAL Plan
*   **Price:** (Varies by Clerk configuration, typically ~$49-99/mo)
*   **Form Capacity:** **Unlimited** forms.
*   **Advanced Features:**
    *   Webhooks: **Yes**
    *   Conditional Logic: **Yes** (Enable smart forms with branching paths)
    *   SSO (Single Sign-On): **Yes** (SAMl/OIDC support for team members)
*   **Best For:** Established businesses requiring dynamic user experiences and advanced security.

#### 4. ENTERPRISE Plan
*   **Price:** Custom Pricing (Managed via Clerk Billing)
*   **Form Capacity:** **Unlimited** forms.
*   **Advanced Features:**
    *   Webhooks: **Yes**
    *   Conditional Logic: **Yes**
    *   SSO (Single Sign-On): **Yes**
    *   Additional: High-volume support, custom limits, and priority service (configurable via Clerk).
*   **Best For:** Organizations with high-scale requirements and specific compliance needs.

### Technical Summary
*   **Entitlement Logic:** Restrictions are enforced server-side in `lib/entitlements.ts` using the `PLAN_FEATURES` constant.
*   **Feature Flags:** The application checks for `webhooks`, `conditional_logic`, and `sso` features directly against the organization's subscription state in Clerk.
*   **UI Components:** The pricing table is rendered dynamically at `/pricing` using Clerk's native billing components, ensuring that plans and prices stay in sync with the Clerk Dashboard settings.
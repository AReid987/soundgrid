# Plan 02-05: Integration & Polish

**Wave**: 5  
**Status**: 📋 PLANNED  
**Duration**: 5-6 hours  
**Backlog Mapping**: E4 (Venue contracts), E6-5 (Notifications)

---

## Objective
Integrate all Phase 2 components, add email notifications, create dashboard widgets, and polish the user experience. Ensure the complete signing flow works end-to-end.

---

## Requirements

### Functional Requirements
- [ ] End-to-end contract signing flow
- [ ] Email notifications (signature requested, signed, completed)
- [ ] Contract status tracking dashboard
- [ ] Mobile-optimized signing experience
- [ ] Performance optimization
- [ ] Security audit

### Email Notifications
- Contract created → Notify all parties
- Signature requested → Notify signer
- Document signed → Notify creator + remaining parties
- All parties signed → Notify all + attach final PDF
- Contract expiring → Reminder emails

---

## Technical Architecture

### Email Service

```typescript
// apps/web/app/lib/email.ts

interface EmailTemplates {
  'contract-created': {
    contractTitle: string;
    creatorName: string;
    previewUrl: string;
  };
  'signature-requested': {
    contractTitle: string;
    signerName: string;
    signUrl: string;
    expiresAt: Date;
  };
  'document-signed': {
    contractTitle: string;
    signerName: string;
    remainingCount: number;
  };
  'contract-completed': {
    contractTitle: string;
    pdfUrl: string;
  };
}

export async function sendEmail<T extends keyof EmailTemplates>(
  template: T,
  to: string,
  data: EmailTemplates[T]
) {
  // Implementation with Resend/Postmark
}
```

### Notification Service

```python
# apps/api/src/soundgrid_api/services/notification_service.py

class NotificationService:
    def on_contract_created(self, contract: Contract):
        """Notify all parties of new contract"""
        for party in contract.parties:
            self.send_email(
                template='contract-created',
                to=party.email,
                data={
                    'contractTitle': contract.title,
                    'creatorName': contract.created_by.name,
                    'previewUrl': f"{BASE_URL}/contracts/{contract.id}"
                }
            )
    
    def on_signature_requested(self, signature_request: SignatureRequest):
        """Notify signer"""
        self.send_email(
            template='signature-requested',
            to=signature_request.party.email,
            data={
                'contractTitle': signature_request.contract.title,
                'signerName': signature_request.party.name,
                'signUrl': signature_request.sign_url,
                'expiresAt': signature_request.expires_at
            }
        )
    
    def on_document_signed(self, signature: Signature):
        """Notify parties of new signature"""
        contract = signature.contract
        remaining = contract.parties.filter(signed_at=None)
        
        # Notify creator
        self.send_email(
            template='document-signed',
            to=contract.created_by.email,
            data={
                'contractTitle': contract.title,
                'signerName': signature.party.name,
                'remainingCount': len(remaining)
            }
        )
        
        # If all signed, send completion
        if len(remaining) == 0:
            self.on_contract_completed(contract)
    
    def on_contract_completed(self, contract: Contract):
        """Notify all parties of completion"""
        for party in contract.parties:
            self.send_email(
                template='contract-completed',
                to=party.email,
                data={
                    'contractTitle': contract.title,
                    'pdfUrl': contract.final_pdf_url
                }
            )
```

---

## Frontend Components

### Dashboard Contract Widget
```typescript
// apps/web/app/components/ContractDashboardWidget.tsx

export function ContractDashboardWidget() {
  const { contracts, isLoading } = useContracts({
    status: ['pending_signature', 'active'],
    limit: 5
  });
  
  return (
    <div className="dashboard-widget">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold">Contracts</h3>
        <Link href="/contracts" className="text-sm text-blue-600">
          View All
        </Link>
      </div>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : contracts.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <ContractListItem
              key={contract.id}
              contract={contract}
            />
          ))}
        </div>
      )}
      
      <Link
        href="/contracts/new"
        className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-center block"
      >
        Create Contract
      </Link>
    </div>
  );
}
```

### Contract Status Badge
```typescript
// apps/web/app/components/ContractStatusBadge.tsx

const statusConfig = {
  draft: { color: 'gray', label: 'Draft' },
  pending_signature: { color: 'yellow', label: 'Awaiting Signatures' },
  partially_signed: { color: 'blue', label: 'Partially Signed' },
  completed: { color: 'green', label: 'Completed' },
  expired: { color: 'red', label: 'Expired' },
  cancelled: { color: 'gray', label: 'Cancelled' }
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const config = statusConfig[status];
  
  return (
    <span className={`badge badge-${config.color}`}>
      {config.label}
    </span>
  );
}
```

### Notification Center
```typescript
// apps/web/app/components/NotificationCenter.tsx

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Subscribe to notifications
    const unsubscribe = subscribeToNotifications((notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((count) => count + 1);
    });
    
    return unsubscribe;
  }, []);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative">
          <BellIcon />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <NotificationList notifications={notifications} />
      </PopoverContent>
    </Popover>
  );
}
```

---

## Email Templates

### Signature Requested
```html
<!-- emails/signature-requested.html -->
<!DOCTYPE html>
<html>
<head>
  <style>
    .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
    .button { background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
    .expiry { color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>You've been asked to sign a document</h1>
    <p>Hi {{signerName}},</p>
    <p><strong>{{contractTitle}}</strong> is ready for your signature.</p>
    <p style="text-align: center; margin: 32px 0;">
      <a href="{{signUrl}}" class="button">Review & Sign</a>
    </p>
    <p class="expiry">This request expires on {{expiresAt}}.</p>
    <hr>
    <p style="font-size: 12px; color: #6b7280;">
      Powered by SoundGrid - Legally binding e-signatures for the music industry
    </p>
  </div>
</body>
</html>
```

---

## Performance Optimizations

### PDF Loading
- [ ] Use PDF.js with lazy loading
- [ ] Implement PDF caching
- [ ] Show thumbnail while loading

### Signature Pad
- [ ] Debounce signature data URL generation
- [ ] Optimize canvas size for mobile
- [ ] Reduce point density for smoother drawing

### API Calls
- [ ] Implement React Query for caching
- [ ] Optimistic updates for signature submission
- [ ] Background polling for status updates

---

## Security Checklist

- [ ] All API endpoints authenticated
- [ ] Rate limiting on signature endpoints
- [ ] CSRF protection
- [ ] Input validation on all forms
- [ ] XSS prevention in PDF rendering
- [ ] Secure storage of private keys
- [ ] Audit logging for all sensitive operations
- [ ] HTTPS only for all endpoints

---

## Mobile Optimization

### Responsive Design
- [ ] Touch-friendly signature pad (min 300px width)
- [ ] Stacked layout for small screens
- [ ] Bottom sheet for actions
- [ ] Thumb-friendly button sizes (min 44px)

### Performance
- [ ] Lazy load PDF viewer
- [ ] Optimize images for mobile
- [ ] Reduce JavaScript bundle size

---

## Implementation Tasks

### Backend
- [ ] Set up email service (Resend/Postmark)
- [ ] Create email templates
- [ ] Implement notification triggers
- [ ] Add contract status webhooks
- [ ] Security audit

### Frontend
- [ ] Create dashboard widget
- [ ] Implement notification center
- [ ] Add status badges
- [ ] Optimize for mobile
- [ ] Add loading states

### DevOps
- [ ] Configure email DNS (SPF, DKIM)
- [ ] Set up email monitoring
- [ ] Performance monitoring
- [ ] Error tracking

---

## E2E Test Scenarios

1. **Full Signing Flow**
   - Create contract with 2 parties
   - Request signatures
   - Both parties sign
   - Verify final PDF generated
   - Verify emails sent at each step

2. **Mobile Signing**
   - Test on iOS Safari
   - Test on Android Chrome
   - Verify signature pad works with touch
   - Verify responsive layout

3. **Error Handling**
   - Network failure during signing
   - Expired signature request
   - Invalid signature data
   - PDF generation failure

---

## Success Criteria
- [ ] Complete signing flow under 5 minutes
- [ ] Email notifications delivered within 30 seconds
- [ ] Dashboard loads in < 2 seconds
- [ ] Mobile signing experience works smoothly
- [ ] All security checks pass
- [ ] E2E tests passing

---

## Dependencies
- Waves 1-4 complete
- Email service account (Resend/Postmark)

---

## Phase 2 Completion Checklist

- [ ] Wave 1: Contract Wizard ✅
- [ ] Wave 2: E-Signature System
- [ ] Wave 3: Contract Versioning
- [ ] Wave 4: DAW Integration
- [ ] Wave 5: Integration & Polish
- [ ] All E2E tests passing
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Performance benchmarks met

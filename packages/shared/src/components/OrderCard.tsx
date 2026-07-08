import React from 'react';
import { View, Text, TouchableOpacity, AccessibilityInfo, Alert } from 'react-native';
import type { OrderRow, AdminPriority } from '../types/order';
import { formatPaiseToINR } from '../format/currency';
import { truncateAddress } from '../format/address';
import { colors } from '../theme/tokens';
import { styles } from './OrderCard.styles';

// ─── Discriminated-union variant prop ──────────────────────────────────────
// ONE component, three modes. This is the public API surface.
// Sub-blocks (CustomerBlock, DriverBlock, AdminBlock) are private to this file.
type OrderCardVariant =
  | { variant: 'customer'; order: OrderRow }
  | { variant: 'driver'; order: OrderRow }
  | { variant: 'admin'; order: OrderRow; onAction?: (order: OrderRow) => void };

export function OrderCard(props: OrderCardVariant) {
  const { order } = props;

  return (
    <View
      style={[
        styles.card,
        props.variant === 'driver' && order.status === 'active' && styles.cardActive,
      ]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={buildAccessibilityLabel(props)}
    >
      {props.variant === 'customer' && <CustomerBlock order={order} />}
      {props.variant === 'driver' && <DriverBlock order={order} />}
      {props.variant === 'admin' && (
        <AdminBlock order={order} onAction={props.onAction} />
      )}
    </View>
  );
}

// ─── Private sub-blocks ────────────────────────────────────────────────────

function CustomerBlock({ order }: { order: OrderRow }) {
  const { color, label } = customerStatusDisplay(order.status);
  const dateLabel = order.placedAt ? formatRelativeDate(order.placedAt) : null;

  return (
    <>
      <View style={styles.headerRow}>
        {/* LPG cylinder icon placeholder */}
        <View style={styles.iconWrapper}>
          <Text style={{ fontSize: 22 }}>🔴</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.skuName} numberOfLines={2}>
            {order.sku ?? '—'}
          </Text>
          {order.amountPaise != null && (
            <Text style={styles.amount}>{formatPaiseToINR(order.amountPaise)}</Text>
          )}
          {dateLabel != null && (
            <Text style={styles.placedAt}>{dateLabel}</Text>
          )}
        </View>
      </View>

      {/* Status badge */}
      <View style={[styles.badge, { backgroundColor: color + '22' }]}>
        <Text style={[styles.badgeText, { color }]}>{label}</Text>
      </View>
    </>
  );
}

function DriverBlock({ order }: { order: OrderRow }) {
  const isActive = order.status === 'active';
  const isDone = order.status === 'done';
  const etaColor = etaColorForMinutes(order.etaMinutes);
  const etaLabel = etaLabelForMinutes(order.etaMinutes);

  const seqBg = isDone
    ? colors.brandLight
    : isActive
    ? colors.brand
    : '#F1F5F9'; // slate-100

  const seqTextColor = isDone || isActive ? colors.brandDark : colors.textSecondary;

  const displayAddress = order.address ? truncateAddress(order.address, 40) : '—';

  return (
    <View
      style={styles.driverMeta}
      accessible
      accessibilityLabel={
        order.address
          ? `Stop ${order.seq ?? '?'}: ${order.customerName ?? ''}, ${order.address}`
          : undefined
      }
    >
      {/* Sequence badge */}
      <View style={[styles.seqBadge, { backgroundColor: seqBg }]}>
        <Text style={[styles.seqText, { color: seqTextColor }]}>
          {isDone ? '✓' : String(order.seq ?? '?')}
        </Text>
      </View>

      {/* Stop info */}
      <View style={{ flex: 1 }}>
        <Text style={[styles.orderId, isActive && { color: colors.brand }]}>
          {order.id}
        </Text>
        <Text style={styles.skuName}>
          {order.customerName ?? '—'}{order.sku ? ` · ${order.sku}` : ''}
        </Text>
        <TouchableOpacity
          onLongPress={() => Alert.alert('Full Address', order.address ?? '')}
          accessibilityLabel={order.address ?? undefined}
        >
          <Text
            style={styles.addressText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {displayAddress}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ETA badge */}
      {!isDone && (
        <View style={[styles.etaBadge, { backgroundColor: etaColor }]}>
          <Text style={styles.etaText}>{etaLabel}</Text>
        </View>
      )}
    </View>
  );
}

function AdminBlock({
  order,
  onAction,
}: {
  order: OrderRow;
  onAction?: (order: OrderRow) => void;
}) {
  const isBreached = order.ageMinutes != null && order.slaMinutes != null
    ? order.ageMinutes > order.slaMinutes
    : order.priority === 'breached';

  const priorityColor = priorityColorForValue(order.priority);
  const priorityLabel = priorityLabelForValue(order.priority, isBreached);
  const ageLabel = order.ageMinutes != null ? formatAge(order.ageMinutes) : null;
  const actionLabel = order.actionRequired ?? order.action ?? 'Action';

  return (
    <>
      {/* ID + category */}
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.orderId, { color: colors.brand }]}>{order.id}</Text>
          <Text style={styles.summaryText} numberOfLines={2}>
            {order.summary ?? '—'}
          </Text>

          {/* Age + SLA */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <Text style={[styles.ageMeta, { color: isBreached ? colors.statusCancelled : colors.textMuted }]}>
              {ageLabel ?? ''}
              {isBreached ? ' ⚠' : ''}
            </Text>
            {order.priority != null && (
              <View style={[styles.priorityChip, { backgroundColor: priorityColor + '22' }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {priorityLabel}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Action button */}
        {onAction != null && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.brand }]}
            onPress={() => onAction(order)}
            accessibilityLabel={`${actionLabel} ${order.id}`}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  );
}

// ─── Helper functions (private) ────────────────────────────────────────────

function customerStatusDisplay(status: string): { color: string; label: string } {
  switch (status) {
    case 'out_for_delivery':
    case 'active':
      return { color: colors.statusActive, label: 'Out for delivery' };
    case 'delivered':
    case 'done':
      return { color: colors.statusDelivered, label: 'Delivered' };
    case 'cancelled':
      return { color: colors.statusCancelled, label: 'Cancelled' };
    case 'returned':
      return { color: colors.statusCancelled, label: 'Returned' };
    case 'pending':
    case 'placed':
    case 'assigned':
    case 'confirmed':
    case 'preparing':
      return { color: colors.statusPending, label: status.charAt(0).toUpperCase() + status.slice(1) };
    default:
      // Unknown status: degrade gracefully — show the raw value, never crash
      return { color: colors.textMuted, label: status };
  }
}

function etaColorForMinutes(etaMin?: number | null): string {
  if (etaMin == null) return colors.etaRed;
  if (etaMin < 15) return colors.etaGreen;
  if (etaMin < 45) return colors.etaAmber;
  return colors.etaRed;
}

function etaLabelForMinutes(etaMin?: number | null): string {
  if (etaMin == null) return 'ETA unavailable';
  return `${etaMin} min`;
}

function priorityColorForValue(priority?: AdminPriority | string): string {
  switch (priority) {
    case 'high': return colors.priorityHigh;
    case 'med': return colors.priorityMed;
    case 'low': return colors.priorityLow;
    case 'breached': return colors.priorityBreached;
    default: return colors.textMuted;
  }
}

function priorityLabelForValue(priority?: AdminPriority | string, breached?: boolean): string {
  if (breached) return '⚠ Breached';
  switch (priority) {
    case 'high': return 'High';
    case 'med': return 'Medium';
    case 'low': return 'Low';
    case 'breached': return '⚠ Breached';
    default: return priority ?? 'Unknown';
  }
}

function formatAge(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function formatRelativeDate(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return iso;
  }
}

function buildAccessibilityLabel(props: OrderCardVariant): string {
  const { order } = props;
  if (props.variant === 'customer') {
    return `Order ${order.id}, ${order.sku ?? ''}, ${order.status}`;
  }
  if (props.variant === 'driver') {
    return `Stop ${order.seq ?? '?'}: ${order.customerName ?? ''}, ${order.address ?? ''}, ETA ${etaLabelForMinutes(order.etaMinutes)}`;
  }
  // admin
  return `${order.id}: ${order.summary ?? ''}, ${order.priority ?? ''}`;
}

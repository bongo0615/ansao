# syntax=docker/dockerfile:1.7
# ---- 1. lớp dependency -----------------------------------------------------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---- 2. lớp build ----------------------------------------------------------
FROM node:20-alpine AS build
WORKDIR /app

# NEXT_PUBLIC_* phải có mặt LÚC BUILD — Next nhúng thẳng vào bundle trình duyệt.
# Thiếu cái nào thì cái đó thành undefined ở client, và đổi giá trị bắt buộc
# phải build lại ảnh chứ không sửa được bằng biến môi trường lúc chạy.
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_APP_VERSION
ARG NEXT_PUBLIC_CHE_DO_KHACH
ARG NEXT_PUBLIC_CHAT_MO
ARG NEXT_PUBLIC_CHO_DANG_KY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_APP_VERSION=$NEXT_PUBLIC_APP_VERSION \
    NEXT_PUBLIC_CHE_DO_KHACH=$NEXT_PUBLIC_CHE_DO_KHACH \
    NEXT_PUBLIC_CHAT_MO=$NEXT_PUBLIC_CHAT_MO \
    NEXT_PUBLIC_CHO_DANG_KY=$NEXT_PUBLIC_CHO_DANG_KY \
    NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- 3. runtime ------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static    ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public          ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=3s --start-period=20s --retries=4 \
  CMD wget -qO- http://127.0.0.1:3000/api/health >/dev/null 2>&1 || exit 1

CMD ["node", "server.js"]

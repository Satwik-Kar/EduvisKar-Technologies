#!/bin/bash
set -e

# ==============================================================================
# EduvisKar Technologies - Production Deployment Engine
# Deploys Main Hub (eduviskar.com) to Server 1 (129.159.239.28)
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" &> /dev/null && pwd)"
TECH_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Resolve Server Config Files Directory (Self-contained with fallbacks)
if [ -d "$SCRIPT_DIR/server_files" ]; then
    SERVER_FILES_DIR="$SCRIPT_DIR/server_files"
elif [ -d "$TECH_DIR/../EduvisKar-Official/eduviskar_official/server_nextjs_files" ]; then
    SERVER_FILES_DIR="$(cd "$TECH_DIR/../EduvisKar-Official/eduviskar_official/server_nextjs_files" && pwd)"
elif [ -d "$TECH_DIR/../EduvisKar Official/eduviskar_official/server_nextjs_files" ]; then
    SERVER_FILES_DIR="$(cd "$TECH_DIR/../EduvisKar Official/eduviskar_official/server_nextjs_files" && pwd)"
else
    SERVER_FILES_DIR=""
fi

export DOCKER_DEFAULT_PLATFORM=linux/amd64

# Parameters
TAG=""
NO_CACHE=false
SERVER_IP="129.159.239.28"
SSH_USER="ubuntu"
SSH_KEY="$HOME/.ssh/server1.key"
DEPLOY_PATH="/home/ubuntu"

show_help() {
    echo "EduvisKar Technologies - Deployment Script"
    echo "Usage: ./deploy.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --Tag <tag>        Specify custom version tag for Docker image (default: git short SHA)"
    echo "  --NoCache          Build Docker image without using cache"
    echo "  --ServerIp <ip>    Target Server IP (default: 129.159.239.28)"
    echo "  --SshUser <user>   SSH Username (default: ubuntu)"
    echo "  --SshKey <path>    SSH Key file path (default: ~/.ssh/server1.key)"
    echo "  --DeployPath <dir> Remote live deploy path (default: /home/ubuntu)"
    echo "  -h, --help         Show this help manual"
    exit 0
}

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --Tag) TAG="$2"; shift ;;
        --NoCache) NO_CACHE=true ;;
        --ServerIp) SERVER_IP="$2"; shift ;;
        --SshUser) SSH_USER="$2"; shift ;;
        --SshKey) SSH_KEY="$2"; shift ;;
        --DeployPath) DEPLOY_PATH="$2"; shift ;;
        -h|--help) show_help ;;
        *) echo "Unknown parameter: $1"; show_help ;;
    esac
    shift
done

function write_step() { echo -e "\n\e[36m>> $1\e[0m"; }
function write_ok() { echo -e "   \e[32m[OK] $1\e[0m"; }
function write_warn() { echo -e "   \e[33m[WARN] $1\e[0m"; }
function write_fatal() { echo -e "\n\e[31m[FAILED] $1\e[0m"; exit 1; }

write_step "Phase 0: Environment Validation"
SSH_KEY="${SSH_KEY/#\~/$HOME}"

if [ ! -f "$SSH_KEY" ]; then
    write_fatal "SSH Key not found at $SSH_KEY. Please check --SshKey parameter."
fi

if [ ! -d "$TECH_DIR" ]; then
    write_fatal "Could not find EduvisKar Technologies directory at $TECH_DIR"
fi

if ! command -v docker &> /dev/null; then
    write_fatal "Docker is not installed or not in PATH."
fi

if ! docker info > /dev/null 2>&1; then
    write_warn "Docker daemon is not running. Attempting to start..."
    sudo systemctl start docker || sudo service docker start || true
    sleep 3
fi

# Retry helper for Docker push
retry_docker_push() {
    local image=$1
    local retries=3
    local wait_time=5
    local attempt=1

    while [ $attempt -le $retries ]; do
        echo -e "   \e[90mPushing image $image (Attempt $attempt of $retries)...\e[0m"
        if docker push "$image"; then
            return 0
        fi
        echo -e "   \e[33mWarning: Docker push failed for $image. Retrying in $wait_time seconds...\e[0m"
        sleep $wait_time
        attempt=$((attempt + 1))
    done

    echo -e "   \e[31mError: Docker push failed for $image after $retries attempts.\e[0m"
    return 1
}

write_step "Phase 1: Resolving Image Tags"
IMAGE_NAME="eduviskar/main"
cd "$TECH_DIR"
GIT_SHORT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "latest")
if [ -n "$TAG" ]; then PRIMARY_TAG="$TAG"; else PRIMARY_TAG="$GIT_SHORT_SHA"; fi
TAG_LATEST="${IMAGE_NAME}:latest"
TAG_VERSION="${IMAGE_NAME}:${PRIMARY_TAG}"

write_step "Phase 2: Building Main Hub Docker Image (${IMAGE_NAME})..."
BUILD_ARGS=("-t" "$TAG_LATEST" "-t" "$TAG_VERSION" ".")
if [ "$NO_CACHE" = true ]; then BUILD_ARGS=("--no-cache" "${BUILD_ARGS[@]}"); fi

docker build "${BUILD_ARGS[@]}" || write_fatal "Docker build failed!"

write_step "Phase 3: Pushing Docker Image to Registry..."
retry_docker_push "$TAG_LATEST" || write_warn "Failed to push $TAG_LATEST"
retry_docker_push "$TAG_VERSION" || true

write_step "Phase 4: Syncing Configs & Deploying to Server 1 via SSH..."
if [ -n "$SERVER_FILES_DIR" ] && [ -f "$SERVER_FILES_DIR/docker-compose.yml" ]; then
    scp -i "$SSH_KEY" -o "StrictHostKeyChecking=no" \
        "$SERVER_FILES_DIR/docker-compose.yml" \
        "$SERVER_FILES_DIR/eduviskar.conf" \
        "$SERVER_FILES_DIR/404.html" \
        "${SSH_USER}@${SERVER_IP}:${DEPLOY_PATH}/" || write_warn "Failed SCP of server configs, proceeding with existing server configs."
else
    write_ok "Using existing server configs on Server 1."
fi

write_step "Phase 5: Executing Remote SSH Deployment..."
ssh -i "$SSH_KEY" -o "StrictHostKeyChecking=no" "${SSH_USER}@${SERVER_IP}" "cd $DEPLOY_PATH && docker compose pull eduviskar_main && docker compose up -d eduviskar_main nginx && docker image prune -f && docker compose restart nginx" || write_fatal "Failed SSH deployment"

write_step "Phase 6: Server Health Check"
sleep 5
if ssh -i "$SSH_KEY" -o "StrictHostKeyChecking=no" "${SSH_USER}@${SERVER_IP}" "docker exec eduviskar_main node -e \"require('http').get('http://localhost:8081', (r) => process.exit(r.statusCode === 200 ? 0 : 1))\""; then
    write_ok "Health check passed! Main hub container (eduviskar_main) responding with 200 OK."
else
    write_warn "Health check ping failed or container pending initialization."
fi

echo -e "\n\e[32m[DONE] EduvisKar Main Hub (eduviskar.com) Deployed successfully!\e[0m"

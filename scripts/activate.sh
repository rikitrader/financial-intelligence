#!/bin/bash

#######################################################################
#  ELITE FINANCIAL INTELLIGENCE & LITIGATION SYSTEM v5
#  License Activation Script
#
#  Copyright © 2026 Ricardo Prieto. All Rights Reserved.
#  Created using Claude Code by Anthropic
#
#  PERSONAL & EDUCATIONAL USE ONLY
#######################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Banner
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║${NC}     ${YELLOW}ELITE FINANCIAL INTELLIGENCE & LITIGATION SYSTEM v5${NC}        ${CYAN}║${NC}"
echo -e "${CYAN}╠══════════════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║${NC}                                                                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${GREEN}Copyright © 2026 Ricardo Prieto. All Rights Reserved.${NC}         ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${BLUE}Created using Claude Code by Anthropic${NC}                        ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                                  ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${YELLOW}PERSONAL & EDUCATIONAL USE ONLY${NC}                               ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}  ${RED}Commercial use is STRICTLY PROHIBITED${NC}                         ${CYAN}║${NC}"
echo -e "${CYAN}║${NC}                                                                  ${CYAN}║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# License file path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
LICENSE_FILE="$SCRIPT_DIR/../.license"
CONFIG_FILE="$SCRIPT_DIR/../.activated"

# Check if already activated
if [ -f "$CONFIG_FILE" ]; then
    STORED_HASH=$(cat "$CONFIG_FILE")
    if [ "$STORED_HASH" == "ACTIVATED_PERSONAL_EDUCATIONAL_USE" ]; then
        echo -e "${GREEN}✓ License already activated.${NC}"
        echo ""
        exit 0
    fi
fi

# License Agreement
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}                     LICENSE AGREEMENT${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "By activating this software, you agree to the following terms:"
echo ""
echo -e "${GREEN}PERMITTED USES:${NC}"
echo "  ✓ Personal, non-commercial use"
echo "  ✓ Educational and learning purposes"
echo "  ✓ Academic projects with proper attribution"
echo "  ✓ Studying code and documentation"
echo ""
echo -e "${RED}PROHIBITED USES:${NC}"
echo "  ✗ Commercial use or profit"
echo "  ✗ Providing professional services to clients"
echo "  ✗ Redistributing without permission"
echo "  ✗ Removing copyright notices"
echo ""
echo -e "${YELLOW}IMPORTANT DISCLAIMER:${NC}"
echo "  This software is for EDUCATIONAL purposes only."
echo "  It does NOT provide legal, tax, financial, or accounting advice."
echo "  Always consult qualified professionals for such matters."
echo ""
echo -e "${YELLOW}═══════════════════════════════════════════════════════════════════${NC}"
echo ""

# Password prompt
echo -e "${CYAN}To activate for Personal & Educational use, enter the license key:${NC}"
echo -e "${BLUE}(Contact the copyright holder for the license key)${NC}"
echo ""

# Read password securely
read -s -p "License Key: " LICENSE_KEY
echo ""
echo ""

# Hash the expected password
# Contact copyright holder for license key
EXPECTED_HASH="42f79a5d7d17c258d4149986cd84a91e"

# Hash the input
INPUT_HASH=$(echo -n "$LICENSE_KEY" | md5)

# Verify
if [ "$INPUT_HASH" == "$EXPECTED_HASH" ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    LICENSE ACTIVATED                             ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║  ✓ Thank you for agreeing to the license terms.                 ║${NC}"
    echo -e "${GREEN}║  ✓ The skill is now activated for Personal & Educational use.  ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}║  Remember:                                                       ║${NC}"
    echo -e "${GREEN}║  • Use only for learning and personal projects                  ║${NC}"
    echo -e "${GREEN}║  • Do not use for commercial purposes                           ║${NC}"
    echo -e "${GREEN}║  • Consult professionals for real advice                        ║${NC}"
    echo -e "${GREEN}║                                                                  ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"

    # Create activation file
    echo "ACTIVATED_PERSONAL_EDUCATIONAL_USE" > "$CONFIG_FILE"
    echo "Activated: $(date)" >> "$CONFIG_FILE"
    echo "User: $USER" >> "$CONFIG_FILE"

    echo ""
    echo -e "${CYAN}You can now use the skill in Claude Code.${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                    INVALID LICENSE KEY                           ║${NC}"
    echo -e "${RED}╠══════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  The license key you entered is incorrect.                       ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  For Personal & Educational use license keys, contact:          ║${NC}"
    echo -e "${RED}║  The copyright holder (see LICENSE.md)                          ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}║  This software cannot be used without proper activation.        ║${NC}"
    echo -e "${RED}║                                                                  ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi

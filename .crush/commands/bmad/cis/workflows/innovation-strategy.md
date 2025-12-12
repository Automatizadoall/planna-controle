# /innovation-strategy Command

When this command is used, execute the following workflow:

## Innovation Strategy Workflow

# Innovation Strategy Workflow Configuration
name: "innovation-strategy"
description: "Identify disruption opportunities and architect business model innovation. This workflow guides strategic analysis of markets, competitive dynamics, and business model innovation to uncover sustainable competitive advantages and breakthrough opportunities."
author: "BMad"

# Critical variables load from config_source
config_source: "{project-root}/.bmad/cis/config.yaml"
output_folder: "{config_source}:output_folder"
user_name: "{config_source}:user_name"
communication_language: "{config_source}:communication_language"
date: system-generated

# Context can be provided via data attribute when invoking
# Example: data="{path}/industry-analysis.md" provides market context

# Module path and component files
installed_path: "{project-root}/.bmad/cis/workflows/innovation-strategy"
template: "{installed_path}/template.md"
instructions: "{installed_path}/instructions.md"

# Required Data Files
innovation_frameworks: "{installed_path}/innovation-frameworks.csv"

# Output configuration
default_output_file: "{output_folder}/innovation-strategy-{{date}}.md"

standalone: true


## Command Usage

This command executes the Innovation Strategy workflow from the BMAD CIS module.

## Module

Part of the BMAD CIS module.

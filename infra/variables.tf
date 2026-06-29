variable "aws_region" {
  description = "Primary AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "github_org" {
  description = "GitHub username or org that owns the repo"
  type        = string
  default     = "teeteeee"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "edge-machine"
}

variable "environment" {
  description = "Deployment environment (staging | production)"
  type        = string
  default     = "staging"

  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be 'staging' or 'production'."
  }
}

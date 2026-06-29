variable "github_org" {
  description = "GitHub username or org (e.g. teeteeee)"
  type        = string
}

variable "github_repo" {
  description = "GitHub repo name (e.g. edge-machine)"
  type        = string
  default     = "edge-machine"
}

variable "aws_region" {
  description = "AWS region for region-scoped permissions"
  type        = string
  default     = "us-east-1"
}

# ─────────────────────────────────────────────────────────────────────────────
# Edge Machine — Root Terraform Module
#
# Manages:  GitHub OIDC trust  (this PR)
#           VPC, EC2, ALB, S3+CloudFront, SSM  (future PRs)
#
# Remote state lives in the S3 bucket created by infra/bootstrap/main.tf.
# Run bootstrap ONCE first, then come back here.
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "edge-machine-tf-state-412058343636"
    key            = "edge-machine/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "edge-machine-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

# ── GitHub OIDC trust ─────────────────────────────────────────────────────────
module "github_oidc" {
  source = "./modules/github-oidc"

  github_org  = var.github_org
  github_repo = var.github_repo
  aws_region  = var.aws_region
}

# ── Outputs ───────────────────────────────────────────────────────────────────
output "github_deployer_role_arn" {
  description = "Paste this into GitHub → Settings → Variables → AWS_ROLE_ARN"
  value       = module.github_oidc.role_arn
}

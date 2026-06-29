# ─────────────────────────────────────────────────────────────────────────────
# Bootstrap — run ONCE manually before anything else:
#   cd infra/bootstrap
#   terraform init
#   terraform apply
#
# Creates the S3 bucket and DynamoDB table used as Terraform remote state
# backend for ALL other modules.  These resources are intentionally NOT
# managed by themselves (chicken-and-egg), so the backend block here is local.
# ─────────────────────────────────────────────────────────────────────────────

terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

# ── S3 bucket for remote state ────────────────────────────────────────────────
resource "aws_s3_bucket" "tf_state" {
  bucket        = "edge-machine-tf-state-${data.aws_caller_identity.current.account_id}"
  force_destroy = false

  tags = { Project = "edge-machine", ManagedBy = "terraform" }
}

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id
  rule {
    apply_server_side_encryption_by_default { sse_algorithm = "AES256" }
  }
}

resource "aws_s3_bucket_public_access_block" "tf_state" {
  bucket                  = aws_s3_bucket.tf_state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── DynamoDB table for state locking ─────────────────────────────────────────
resource "aws_dynamodb_table" "tf_locks" {
  name         = "edge-machine-tf-locks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = { Project = "edge-machine", ManagedBy = "terraform" }
}

data "aws_caller_identity" "current" {}

output "state_bucket" {
  value = aws_s3_bucket.tf_state.bucket
}

output "lock_table" {
  value = aws_dynamodb_table.tf_locks.name
}

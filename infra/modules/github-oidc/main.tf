# ─────────────────────────────────────────────────────────────────────────────
# Module: github-oidc
#
# Creates:
#   1. AWS IAM OIDC Identity Provider for GitHub Actions
#   2. IAM Role that GitHub Actions workflows can assume via OIDC
#      (scoped to a specific repo and branches — no long-lived keys)
# ─────────────────────────────────────────────────────────────────────────────

# GitHub's OIDC provider TLS thumbprint (stable — GitHub rotates the cert
# but keeps the same thumbprint for compatibility)
locals {
  github_thumbprint = "6938fd4d98bab03faadb97b34396831e3780aea1"
}

# ── OIDC Provider ─────────────────────────────────────────────────────────────
resource "aws_iam_openid_connect_provider" "github" {
  url             = "https://token.actions.githubusercontent.com"
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [local.github_thumbprint]

  tags = { Project = "edge-machine", ManagedBy = "terraform" }
}

# ── IAM Role ──────────────────────────────────────────────────────────────────
data "aws_iam_policy_document" "github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # Allow only your repo — restrict to main and develop branches
    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/main",
        "repo:${var.github_org}/${var.github_repo}:ref:refs/heads/develop",
        "repo:${var.github_org}/${var.github_repo}:pull_request",
      ]
    }
  }
}

resource "aws_iam_role" "github_deployer" {
  name               = "edge-machine-github-deployer"
  assume_role_policy = data.aws_iam_policy_document.github_assume_role.json
  max_session_duration = 3600  # 1 hour

  tags = { Project = "edge-machine", ManagedBy = "terraform" }
}

# ── Deployer permissions ───────────────────────────────────────────────────────
# Scoped to what the pipeline actually needs — nothing more.
data "aws_iam_policy_document" "deployer_permissions" {

  # Terraform state backend
  statement {
    sid    = "TerraformState"
    effect = "Allow"
    actions = [
      "s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"
    ]
    resources = [
      "arn:aws:s3:::edge-machine-tf-state-*",
      "arn:aws:s3:::edge-machine-tf-state-*/*"
    ]
  }

  statement {
    sid    = "TerraformLock"
    effect = "Allow"
    actions = [
      "dynamodb:GetItem", "dynamodb:PutItem",
      "dynamodb:DeleteItem", "dynamodb:DescribeTable"
    ]
    resources = ["arn:aws:dynamodb:*:*:table/edge-machine-tf-locks"]
  }

  # EC2 infrastructure (Terraform needs to create/modify/destroy)
  statement {
    sid    = "EC2"
    effect = "Allow"
    actions = [
      "ec2:*",
      "elasticloadbalancing:*",
      "autoscaling:*"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:RequestedRegion"
      values   = [var.aws_region]
    }
  }

  # VPC networking
  statement {
    sid    = "VPC"
    effect = "Allow"
    actions = ["ec2:*Vpc*", "ec2:*Subnet*", "ec2:*Gateway*",
               "ec2:*Route*", "ec2:*SecurityGroup*", "ec2:*NetworkAcl*"]
    resources = ["*"]
  }

  # IAM — only for managing instance profiles (not creating users/roles)
  statement {
    sid    = "IAMInstanceProfiles"
    effect = "Allow"
    actions = [
      "iam:CreateInstanceProfile", "iam:DeleteInstanceProfile",
      "iam:AddRoleToInstanceProfile", "iam:RemoveRoleFromInstanceProfile",
      "iam:GetInstanceProfile", "iam:PassRole",
      "iam:CreateRole", "iam:DeleteRole", "iam:GetRole", "iam:UpdateRole",
      "iam:AttachRolePolicy", "iam:DetachRolePolicy",
      "iam:PutRolePolicy", "iam:DeleteRolePolicy", "iam:GetRolePolicy",
      "iam:ListRolePolicies", "iam:ListAttachedRolePolicies",
      "iam:TagRole", "iam:UntagRole"
    ]
    resources = ["arn:aws:iam::*:role/edge-machine-*",
                 "arn:aws:iam::*:instance-profile/edge-machine-*"]
  }

  # S3 + CloudFront for frontend
  statement {
    sid    = "S3Frontend"
    effect = "Allow"
    actions = ["s3:*"]
    resources = [
      "arn:aws:s3:::edge-machine-*",
      "arn:aws:s3:::edge-machine-*/*"
    ]
  }

  statement {
    sid    = "CloudFront"
    effect = "Allow"
    actions = ["cloudfront:*"]
    resources = ["*"]
  }

  # ACM certificates
  statement {
    sid    = "ACM"
    effect = "Allow"
    actions = ["acm:*"]
    resources = ["*"]
  }

  # SSM — read secrets for deployment validation, write app secrets
  statement {
    sid    = "SSMSecrets"
    effect = "Allow"
    actions = [
      "ssm:GetParameter", "ssm:GetParameters", "ssm:PutParameter",
      "ssm:DeleteParameter", "ssm:DescribeParameters", "ssm:AddTagsToResource"
    ]
    resources = ["arn:aws:ssm:*:*:parameter/edge-machine/*"]
  }

  # KMS — for SSM SecureString encryption
  statement {
    sid    = "KMS"
    effect = "Allow"
    actions = ["kms:Decrypt", "kms:GenerateDataKey", "kms:DescribeKey"]
    resources = ["*"]
  }

  # CloudWatch for monitoring setup
  statement {
    sid    = "CloudWatch"
    effect = "Allow"
    actions = ["cloudwatch:*", "logs:*"]
    resources = ["*"]
  }

  # Route 53 for DNS
  statement {
    sid      = "Route53"
    effect   = "Allow"
    actions  = ["route53:*", "route53domains:*"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "deployer_permissions" {
  name   = "edge-machine-deployer-policy"
  policy = data.aws_iam_policy_document.deployer_permissions.json
  tags   = { Project = "edge-machine", ManagedBy = "terraform" }
}

resource "aws_iam_role_policy_attachment" "deployer" {
  role       = aws_iam_role.github_deployer.name
  policy_arn = aws_iam_policy.deployer_permissions.arn
}

terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

variable "vercel_api_token" {
  type      = string
  sensitive = true
}
variable "github_repo" {
  type = string # e.g. "yourname/mayurmasala"
}
variable "supabase_access_token" {
  type      = string
  sensitive = true
}
variable "supabase_org_id" {
  type = string
}
variable "supabase_db_password" {
  type      = string
  sensitive = true
}
variable "project_name" {
  type    = string
  default = "mayurmasala"
}
variable "region" {
  type    = string
  default = "ap-south-1" # Mumbai, closest to Pune
}

provider "vercel" {
  api_token = var.vercel_api_token
}

provider "supabase" {
  access_token = var.supabase_access_token
}

# ---------------- Supabase project ----------------
resource "supabase_project" "this" {
  organization_id   = var.supabase_org_id
  name              = var.project_name
  database_password = var.supabase_db_password
  region            = var.region
}

# ---------------- Vercel project (linked to GitHub) ----------------
resource "vercel_project" "this" {
  name      = var.project_name
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = var.github_repo
  }
}

resource "vercel_project_environment_variable" "supabase_url" {
  project_id = vercel_project.this.id
  key        = "NEXT_PUBLIC_SUPABASE_URL"
  value      = "https://${supabase_project.this.id}.supabase.co"
  target     = ["production", "preview", "development"]
}

resource "vercel_project_environment_variable" "supabase_anon_key" {
  project_id = vercel_project.this.id
  key        = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  value      = supabase_project.this.anon_key
  target     = ["production", "preview", "development"]
  sensitive  = true
}

resource "vercel_project_environment_variable" "supabase_service_role" {
  project_id = vercel_project.this.id
  key        = "SUPABASE_SERVICE_ROLE_KEY"
  value      = supabase_project.this.service_role_key
  target     = ["production"]
  sensitive  = true
}

variable "telegram_bot_token" {
  type      = string
  sensitive = true
  default   = ""
}

resource "vercel_project_environment_variable" "telegram_token" {
  project_id = vercel_project.this.id
  key        = "TELEGRAM_BOT_TOKEN"
  value      = var.telegram_bot_token
  target     = ["production"]
  sensitive  = true
}

output "supabase_url" {
  value = "https://${supabase_project.this.id}.supabase.co"
}

output "vercel_project_url" {
  value = "https://${vercel_project.this.name}.vercel.app"
}

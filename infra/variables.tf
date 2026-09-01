variable "cloudflare_api_token" {
  description = "Cloudflare API token with Zone:Read and DNS:Edit on the zone"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for the domain"
  type        = string
  sensitive   = true
}

variable "domain" {
  description = "Apex domain the notebook lives under"
  type        = string
  default     = "petri.zip"
}

variable "subdomain" {
  description = "Subdomain serving the notebook"
  type        = string
  default     = "notebook"
}

variable "github_pages_cname" {
  description = "GitHub Pages CNAME target for the account hosting the repository"
  type        = string
  default     = "petri-hub.github.io"
}

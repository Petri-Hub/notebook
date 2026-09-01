resource "cloudflare_dns_record" "notebook" {
  zone_id = var.cloudflare_zone_id
  name    = "${var.subdomain}.${var.domain}"
  type    = "CNAME"
  content = var.github_pages_cname
  proxied = false
  ttl     = 60
  comment = "Notebook pointing at GitHub Pages"
}

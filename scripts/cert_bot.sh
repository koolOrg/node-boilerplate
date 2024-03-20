sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ${domain} -d www.${domain}
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
variable "region_list" {
  type    = list(string)
  default = ["us-east-1"]
}

variable "instance_type" {
  type    = string
  default = "t3.medium"
}

variable "environment" {
  type    = string
  default = "dev"
}

variable "enable_multi_region" {
  type    = bool
  default = false
}

variable "cassandra_cluster_size" {
  type    = number
  default = 3
}

# Provider configuration (simulated for multi-region)
# provider "aws" {
#   region = var.region_list[0]
# }

resource "null_resource" "deploy_cassandra_cluster" {
  count = var.enable_multi_region ? length(var.region_list) : 1

  triggers = {
    cluster_size = var.cassandra_cluster_size
    region       = var.region_list[count.index]
  }

  provisioner "local-exec" {
    command = "echo Deploying Cassandra cluster in ${var.region_list[count.index]} with size ${var.cassandra_cluster_size}"
  }
}

resource "null_resource" "deploy_gateway_nodes" {
  count = length(var.region_list)

  provisioner "local-exec" {
    command = "echo Deploying Gateway Node in ${var.region_list[count.index]}"
  }
}

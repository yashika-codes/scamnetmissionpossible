import networkx as nx

class FraudGraphService:
    def __init__(self):
        self.graph = nx.Graph()
        self.complaints = []
        self.reset_graph()

    def reset_graph(self):
        """Clears graph and loads seed dataset from mock_data."""
        from backend.mock_data import SEED_COMPLAINTS
        self.graph.clear()
        self.complaints = []

        for cmp in SEED_COMPLAINTS:
            self.add_complaint(cmp)

    def add_complaint(self, cmp: dict) -> dict:
        """Adds a complaint and connects entity nodes to form cross-state networks."""
        cmp_id = cmp["id"]

        # Track complaint dict
        self.complaints.append(cmp)

        # Add complaint node
        self.graph.add_node(
            cmp_id,
            type="complaint",
            label=cmp_id,
            victim_name=cmp.get("victim_name", "Anonymous"),
            scam_type=cmp.get("scam_type", "Fraud"),
            state=cmp.get("state", "India"),
            amount_lost=cmp.get("amount_lost", 0),
            risk_level=cmp.get("risk_level", "HIGH"),
            raw_text=cmp.get("raw_text", "")
        )

        # Add State Node
        state = cmp.get("state", "Unknown")
        if state:
            self.graph.add_node(state, type="state", label=state)
            self.graph.add_edge(cmp_id, state, relation="REPORTED_IN")

        # Connect Phones
        for phone in cmp.get("phone_numbers", []):
            if not self.graph.has_node(phone):
                self.graph.add_node(phone, type="phone", label=phone, complaints_count=0)
            self.graph.nodes[phone]["complaints_count"] = self.graph.nodes[phone].get("complaints_count", 0) + 1
            self.graph.add_edge(cmp_id, phone, relation="USES_PHONE")

        # Connect UPI IDs
        for upi in cmp.get("upi_ids", []):
            if not self.graph.has_node(upi):
                self.graph.add_node(upi, type="upi", label=upi, complaints_count=0)
            self.graph.nodes[upi]["complaints_count"] = self.graph.nodes[upi].get("complaints_count", 0) + 1
            self.graph.add_edge(cmp_id, upi, relation="USES_UPI")

        # Connect Banks
        for bank in cmp.get("bank_names", []):
            if not self.graph.has_node(bank):
                self.graph.add_node(bank, type="bank", label=bank)
            self.graph.add_edge(cmp_id, bank, relation="TARGETS_BANK")

        # Connect URLs
        for url in cmp.get("urls", []):
            if not self.graph.has_node(url):
                self.graph.add_node(url, type="url", label=url)
            self.graph.add_edge(cmp_id, url, relation="USES_PHISHING_URL")

        return cmp

    def detect_clusters(self) -> list:
        """Finds connected components forming cross-state scam rings."""
        components = list(nx.connected_components(self.graph))
        clusters = []

        cluster_id = 1
        for comp in components:
            if len(comp) < 2:
                continue

            subgraph = self.graph.subgraph(comp)

            # Collect nodes in this cluster
            nodes_info = []
            complaints_in_cluster = []
            states_in_cluster = set()
            phones_in_cluster = set()
            upis_in_cluster = set()
            total_amount = 0

            for node in comp:
                node_data = self.graph.nodes[node]
                nodes_info.append({"id": node, **node_data})

                ntype = node_data.get("type")
                if ntype == "complaint":
                    complaints_in_cluster.append(node)
                    total_amount += node_data.get("amount_lost", 0)
                elif ntype == "state":
                    states_in_cluster.add(node)
                elif ntype == "phone":
                    phones_in_cluster.add(node)
                elif ntype == "upi":
                    upis_in_cluster.add(node)

            # Determine risk severity
            is_cross_state = len(states_in_cluster) > 1
            complaint_count = len(complaints_in_cluster)

            if complaint_count >= 3 or is_cross_state:
                cluster_risk = "CRITICAL ALERT - MULTI-STATE RING"
            elif complaint_count >= 2:
                cluster_risk = "HIGH RISK CLUSTER"
            else:
                cluster_risk = "EMERGING THREAT"

            clusters.append({
                "cluster_id": f"RING-#{100 + cluster_id}",
                "title": f"Syndicate #{100 + cluster_id} ({len(states_in_cluster)} States, {complaint_count} Reports)",
                "risk_label": cluster_risk,
                "states": list(states_in_cluster),
                "complaints_count": complaint_count,
                "total_amount_lost": total_amount,
                "shared_phones": list(phones_in_cluster),
                "shared_upis": list(upis_in_cluster),
                "node_count": len(comp),
                "nodes": nodes_info
            })
            cluster_id += 1

        clusters.sort(key=lambda x: (x["complaints_count"], len(x["states"])), reverse=True)
        return clusters

    def check_entity_risk(self, target: str) -> dict:
        """Looks up a phone number or UPI handle to calculate immediate risk score."""
        target_clean = target.strip().lower()

        # Find matching node
        found_node = None
        for n in self.graph.nodes:
            if n.lower() == target_clean or target_clean in n.lower():
                found_node = n
                break

        if not found_node:
            return {
                "target": target,
                "found": False,
                "risk_level": "SAFE / CLEAN",
                "risk_score": 0,
                "complaints_count": 0,
                "linked_states": [],
                "total_amount_lost": 0,
                "recommendation": "No registered cyber complaints found for this handle. Safe to proceed with standard precautions."
            }

        # Subgraph search for linked complaints
        neighbors = list(self.graph.neighbors(found_node))
        linked_complaints = [n for n in neighbors if self.graph.nodes[n].get("type") == "complaint"]

        states = set()
        total_loss = 0
        scam_types = set()

        for cmp_id in linked_complaints:
            cmp_data = self.graph.nodes[cmp_id]
            states.add(cmp_data.get("state", "India"))
            total_loss += cmp_data.get("amount_lost", 0)
            scam_types.add(cmp_data.get("scam_type", "Scam"))

        c_count = len(linked_complaints)
        if c_count == 0:
            return {
                "target": target,
                "found": True,
                "risk_level": "SAFE / CLEAN",
                "risk_score": 0,
                "complaints_count": 0,
                "linked_states": [],
                "total_amount_lost": 0,
                "recommendation": "No registered cyber complaints found for this handle. Safe to proceed with standard precautions."
            }

        risk_score = min(99, 50 + c_count * 20 + len(states) * 15)

        return {
            "target": target,
            "found": True,
            "risk_level": "CRITICAL DANGER" if risk_score > 75 else "HIGH RISK",
            "risk_score": risk_score,
            "complaints_count": c_count,
            "linked_states": list(states),
            "total_amount_lost": total_loss,
            "scam_types": list(scam_types),
            "recommendation": f"ALERT: '{target}' is flagged in {c_count} official cyber complaints across {len(states)} states ({', '.join(states)}). DO NOT SEND MONEY!"
        }


    def get_graph_data(self) -> dict:
        """Formats nodes and links for frontend D3 / Canvas visualizer."""
        nodes = []
        for n, data in self.graph.nodes(data=True):
            # Calculate degree for sizing
            degree = self.graph.degree(n)
            nodes.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("type", "unknown"),
                "state": data.get("state", ""),
                "risk_level": data.get("risk_level", "MEDIUM"),
                "degree": degree,
                "complaints_count": data.get("complaints_count", 1)
            })

        links = []
        for u, v, data in self.graph.edges(data=True):
            links.append({
                "source": u,
                "target": v,
                "relation": data.get("relation", "LINKED")
            })

        clusters = self.detect_clusters()

        # Compute summary metrics
        total_complaints = len(self.complaints)
        total_amount = sum(c.get("amount_lost", 0) for c in self.complaints)
        unique_states = len(set(c.get("state") for c in self.complaints if c.get("state")))

        return {
            "nodes": nodes,
            "links": links,
            "clusters": clusters,
            "summary": {
                "total_complaints": total_complaints,
                "active_syndicates": len(clusters),
                "total_financial_loss": total_amount,
                "impacted_states": unique_states
            }
        }


# Global Singleton Instance
fraud_graph_service = FraudGraphService()

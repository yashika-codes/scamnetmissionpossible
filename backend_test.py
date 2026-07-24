import asyncio
from backend.services.graph_service import fraud_graph_service

async def main():
    print("=== TESTING UPI HANDLE RISK SCORES ===")

    # 1. Clean / Safe handle
    safe_res = fraud_graph_service.check_entity_risk("trusted.shop@upi")
    print(f"Target: '{safe_res['target']}'")
    print(f"   -> Risk Score: {safe_res['risk_score']} / 100")
    print(f"   -> Risk Level: {safe_res['risk_level']}")
    assert safe_res['risk_score'] == 0, f"Clean handle risk score must be 0, got {safe_res['risk_score']}"

    # 2. Flagged Fraud handle
    scam_res = fraud_graph_service.check_entity_risk("cbi.verify@okicici")
    print(f"\nTarget: '{scam_res['target']}'")
    print(f"   -> Risk Score: {scam_res['risk_score']} / 100")
    print(f"   -> Risk Level: {scam_res['risk_level']}")
    assert scam_res['risk_score'] > 50, f"Scam handle risk score must be > 50, got {scam_res['risk_score']}"

    print("\nALL UPI RISK SCORE TESTS PASSED 100% CLEANLY!")

if __name__ == "__main__":
    asyncio.run(main())

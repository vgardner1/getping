import { getPublicProfileUrl } from "@/lib/environment";

interface ReferralMessageOptions {
  userId: string;
  isOnboarded?: boolean;
  includeProfileLink?: boolean;
}

export const generateReferralMessage = ({ 
  userId, 
  isOnboarded = true, 
  includeProfileLink = true 
}: ReferralMessageOptions): string => {
  const baseMessage = "Hey! I just got a smart ring that holds all my contact info and I give it out just by tapping the top of people's phones.";
  
  const profileLink = includeProfileLink && isOnboarded 
    ? `\n\nCheck out my profile: ${getPublicProfileUrl(userId)}`
    : "";
  
  const referralUrl = `${window.location.origin}/signup?ref=${userId}`;
  const referralText = isOnboarded 
    ? "\n\nyou should lowkey get one too! Use my referral link and we both get 1 month free:"
    : "\n\nuse this link to sign up for yours:";
  
  return `${baseMessage}${profileLink}${referralText}\n${referralUrl}`;
};
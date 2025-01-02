/**
 * Validates the selected text to ensure it is a valid job description.
 * @param {string} text - The selected text to validate.
 * @returns {object} - Validation result with isValid (boolean) and message (string).
 */
export function validateSelectedText(text) {
  console.log("Validating Text:", text); // Log the input text

  // Minimum length for a valid job description
  const minLength = 100;

  // Keywords that indicate it's a valid job description
  const keywords = ["responsibilities", "requirements", "skills", "experience"];

  // Check if the text is too short
  if (text.length < minLength) {
    console.log("Validation failed: Text is too short.");
    return {
      isValid: false,
      message: "Selected text is too short to be a job description.",
    };
  }

  // Check if the text contains at least one of the required keywords
  const hasKeywords = keywords.some((keyword) =>
    text.toLowerCase().includes(keyword)
  );
  if (!hasKeywords) {
    console.log("Validation failed: No keywords found in the text.");
    return {
      isValid: false,
      message: "Selected text doesn't seem like a valid job description.",
    };
  }

  // Validation passed
  console.log("Validation passed.");
  return { isValid: true };
}

import os
import openai
from .promptList import generatePerplexityPrompt_sys
from ..dataModels import PerplexityPrompt

def create_prompt(
        tagType : str,
        tagName : str,
        tagDesc : str
        ):
    

    model = 'gpt-4o'
    if(tagType == 'industry'):

        user_prompt = (
            "Description will be used to identify if a company operates in this industry or does this work"
            f"Description of {tagName} industry : {tagDesc}"
        )

        response = openai.beta.chat.completions.parse(
            model=model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": generatePerplexityPrompt_sys},
                {"role": "user", "content": user_prompt},
            ],
            response_format=PerplexityPrompt
        )
    elif(tagType == 'customer'):

        user_prompt = (
            "The description will be used to identify if a company services this kind of customer"
            f"Description of {tagName} customers : {tagDesc}"
        )

        response = openai.beta.chat.completions.parse(
            model=model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": generatePerplexityPrompt_sys},
                {"role": "user", "content": user_prompt},
            ],
            response_format=PerplexityPrompt
        )
    elif(tagType == 'custom'):

        return PerplexityPrompt(
            desc='Press submit directly to save the prompt',
            suggested_changes=['Not available for custom prompts']
        )

    return response.choices[0].message.parsed